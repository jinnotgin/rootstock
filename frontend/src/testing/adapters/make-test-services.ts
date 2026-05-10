import { ApiKey, AuthResponse, Limits, Model, User, UsageSummary } from '@/domain/types';
import { AppServices } from '@/services/app-services-provider';

type TestServiceOverrides = Partial<AppServices>;

const now = 1715299200000;

export const testUser: User = {
	id: 'test-user-1',
	createdAt: now,
	email: 'user@example.com',
	role: 'USER',
	status: 'active',
	allowedModelIds: ['model-sonnet'],
	customLimitUsd: 20,
	bifrostKeyId: 'bfk-test-001',
};

export const testAdminUser: User = {
	id: 'test-admin-1',
	createdAt: now,
	email: 'admin@example.com',
	role: 'ADMIN',
	status: 'active',
	allowedModelIds: ['model-opus', 'model-sonnet', 'model-gemini'],
	customLimitUsd: null,
	bifrostKeyId: 'bfk-admin-001',
};

export const testApiKey: ApiKey = {
	userId: testUser.id,
	key: 'sk-gateway-test-key',
	bifrostKeyId: testUser.bifrostKeyId,
	createdAt: now,
};

export const testModel: Model = {
	id: 'model-sonnet',
	createdAt: now,
	name: 'claude-sonnet-4-6',
	provider: 'anthropic',
	isActive: true,
	pricePerInputTokenUsd: 0.000003,
	pricePerOutputTokenUsd: 0.000015,
};

export const testUsage: UsageSummary = {
	userId: testUser.id,
	weekStart: '2026-05-05',
	totalCostUsd: 7.2,
	totalInputTokens: 1920000,
	totalOutputTokens: 240000,
};

export const testLimits: Limits = { globalWeeklyLimitUsd: 100 };

const authResponse: AuthResponse = { token: 'test-token', user: testUser };

export const makeTestServices = (overrides: TestServiceOverrides = {}): AppServices => ({
	auth: {
		getCurrentUser: async () => testUser,
		login: async () => authResponse,
		setPassword: async () => authResponse,
		logout: async () => {},
	},
	gateway: {
		getApiKey: async () => testApiKey,
		rotateApiKey: async () => ({ ...testApiKey, key: 'sk-gateway-rotated-key', createdAt: now + 1 }),
		getUsage: async () => testUsage,
		listModels: async () => [testModel],
	},
	admin: {
		listUsers: async () => [testUser, testAdminUser],
		createUser: async (input) => ({
			...testUser,
			id: 'new-user',
			email: input.email,
			role: input.role,
			allowedModelIds: input.allowedModelIds,
			customLimitUsd: input.customLimitUsd,
			status: 'pending' as const,
			bifrostKeyId: 'bfk-new',
		}),
		updateUser: async (_id, input) => ({ ...testUser, ...input }),
		deleteUser: async () => {},
		listAllModels: async () => [testModel],
		updateModel: async (_id, input) => ({ ...testModel, ...input }),
		getGlobalLimits: async () => testLimits,
		updateGlobalLimits: async (input) => input,
	},
	...overrides,
});
