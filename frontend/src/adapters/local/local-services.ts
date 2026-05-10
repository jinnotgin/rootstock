import { LocalDatabase, createId, currentWeekStart } from './local-database';
import { LocalScenario, localScenarioData } from './local-scenarios';

import { ApiKey, AuthResponse, Limits, Model, User, UsageSummary } from '@/domain/types';
import { AdminProvider, CreateUserInput, UpdateModelInput, UpdateUserInput } from '@/ports/admin';
import { AuthProvider, LoginInput, SetPasswordInput } from '@/ports/auth';
import { GatewayProvider } from '@/ports/gateway';
import { AppServices } from '@/services/app-services-provider';

const now = () => Date.now();

const currentUser = async (db: LocalDatabase): Promise<User> => {
	const sessions = await db.getAll<{ userId: string }>('session');
	const session = sessions[0];
	if (!session) throw new Error('Unauthorized');
	const user = await db.get<User>('users', session.userId);
	if (!user) throw new Error('Unauthorized');
	return user;
};

const requireAdmin = async (db: LocalDatabase): Promise<User> => {
	const user = await currentUser(db);
	if (user.role !== 'ADMIN') throw new Error('Forbidden');
	return user;
};

class LocalAuthProvider implements AuthProvider {
	constructor(private readonly db: LocalDatabase) {}

	async getCurrentUser(): Promise<User | null> {
		const sessions = await this.db.getAll<{ userId: string }>('session');
		const session = sessions[0];
		if (!session) return null;
		return (await this.db.get<User>('users', session.userId)) ?? null;
	}

	async login(input: LoginInput): Promise<AuthResponse> {
		const users = await this.db.getAll<User & { password?: string }>('users');
		const user = users.find((u) => u.email === input.email);

		if (!user) throw new Error('No account found for this email. Contact an admin to be added.');

		if (user.status === 'pending' || !user.password) {
			const error: Error & { code?: string; email?: string } = new Error('PASSWORD_NOT_SET');
			error.code = 'PASSWORD_NOT_SET';
			error.email = user.email;
			throw error;
		}

		if (user.password !== input.password) throw new Error('Invalid password.');

		await this.db.clear('session');
		await this.db.put('session', { userId: user.id });
		return { token: btoa(JSON.stringify({ id: user.id })), user };
	}

	async setPassword(input: SetPasswordInput): Promise<AuthResponse> {
		const users = await this.db.getAll<User & { password?: string }>('users');
		const user = users.find((u) => u.email === input.email);
		if (!user) throw new Error('No account found for this email.');

		const updated: User & { password: string } = { ...user, status: 'active', password: input.password };
		await this.db.put('users', updated);
		await this.db.clear('session');
		await this.db.put('session', { userId: user.id });
		return { token: btoa(JSON.stringify({ id: user.id })), user: updated };
	}

	async logout(): Promise<void> {
		await this.db.clear('session');
	}
}

class LocalGatewayProvider implements GatewayProvider {
	constructor(private readonly db: LocalDatabase) {}

	async getApiKey(userId: string): Promise<ApiKey> {
		const key = await this.db.get<ApiKey>('api-keys', userId);
		if (!key) throw new Error('API key not found');
		return key;
	}

	async rotateApiKey(userId: string): Promise<ApiKey> {
		const user = await this.db.get<User>('users', userId);
		if (!user) throw new Error('User not found');
		const newKey: ApiKey = {
			userId,
			key: `sk-gateway-${createId()}`,
			bifrostKeyId: user.bifrostKeyId,
			createdAt: now(),
		};
		await this.db.put('api-keys', newKey);
		return newKey;
	}

	async getUsage(userId: string, weekStart: string): Promise<UsageSummary> {
		const all = await this.db.getAll<UsageSummary>('usage');
		const record = all.find((u) => u.userId === userId && u.weekStart === weekStart);
		return record ?? { userId, weekStart, totalCostUsd: 0, totalInputTokens: 0, totalOutputTokens: 0 };
	}

	async listModels(userId: string): Promise<Model[]> {
		const user = await this.db.get<User>('users', userId);
		if (!user) throw new Error('User not found');
		const allModels = await this.db.getAll<Model>('models');
		return allModels.filter((m) => m.isActive && user.allowedModelIds.includes(m.id));
	}
}

class LocalAdminProvider implements AdminProvider {
	constructor(private readonly db: LocalDatabase) {}

	async listUsers(): Promise<User[]> {
		await requireAdmin(this.db);
		return this.db.getAll<User>('users');
	}

	async createUser(input: CreateUserInput): Promise<User> {
		await requireAdmin(this.db);
		const users = await this.db.getAll<User>('users');
		if (users.some((u) => u.email === input.email)) {
			throw new Error('A user with this email already exists.');
		}
		const bifrostKeyId = `bfk-${createId()}`;
		const user: User = {
			id: createId(),
			createdAt: now(),
			email: input.email,
			role: input.role,
			status: 'pending',
			allowedModelIds: input.allowedModelIds,
			customLimitUsd: input.customLimitUsd,
			bifrostKeyId,
		};
		await this.db.put('users', user);
		const apiKey: ApiKey = {
			userId: user.id,
			key: `sk-gateway-${bifrostKeyId}`,
			bifrostKeyId,
			createdAt: now(),
		};
		await this.db.put('api-keys', apiKey);
		return user;
	}

	async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
		await requireAdmin(this.db);
		const user = await this.db.get<User>('users', userId);
		if (!user) throw new Error('User not found.');
		const updated: User = { ...user, ...input };
		await this.db.put('users', updated);
		return updated;
	}

	async deleteUser(userId: string): Promise<void> {
		await requireAdmin(this.db);
		const user = await this.db.get<User>('users', userId);
		if (!user) throw new Error('User not found.');
		await this.db.delete('users', userId);
		await this.db.delete('api-keys', userId);
	}

	async listAllModels(): Promise<Model[]> {
		await requireAdmin(this.db);
		return this.db.getAll<Model>('models');
	}

	async updateModel(modelId: string, input: UpdateModelInput): Promise<Model> {
		await requireAdmin(this.db);
		const model = await this.db.get<Model>('models', modelId);
		if (!model) throw new Error('Model not found.');
		const updated: Model = { ...model, ...input };
		await this.db.put('models', updated);
		return updated;
	}

	async getGlobalLimits(): Promise<Limits> {
		await requireAdmin(this.db);
		const record = await this.db.get<{ key: string; value: number }>('settings', 'globalWeeklyLimitUsd');
		return { globalWeeklyLimitUsd: record?.value ?? 100 };
	}

	async updateGlobalLimits(input: Limits): Promise<Limits> {
		await requireAdmin(this.db);
		await this.db.put('settings', { key: 'globalWeeklyLimitUsd', value: input.globalWeeklyLimitUsd });
		return input;
	}
}

export const makeLocalServices = ({ scenario = 'empty' }: { scenario?: LocalScenario } = {}): AppServices => {
	const data = localScenarioData(scenario);
	const db = new LocalDatabase(data as any);
	return {
		auth: new LocalAuthProvider(db),
		gateway: new LocalGatewayProvider(db),
		admin: new LocalAdminProvider(db),
	};
};

export { currentWeekStart };
