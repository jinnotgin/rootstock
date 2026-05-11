import { createId, currentWeekStart } from './local-database';

import { ApiKey, Limits, Model, UsageSummary, User } from '@/domain/types';

export type LocalScenario = 'empty' | 'logged-out' | 'normal-user' | 'admin-user' | 'pending-user' | 'at-limit';

const WEEK_START = currentWeekStart();

const MODELS: Model[] = [
	{
		id: 'model-opus',
		createdAt: 1000000,
		name: 'claude-opus-4-6',
		provider: 'anthropic',
		isActive: true,
		pricePerInputTokenUsd: 0.000015,
		pricePerOutputTokenUsd: 0.000075,
	},
	{
		id: 'model-sonnet',
		createdAt: 1000001,
		name: 'claude-sonnet-4-6',
		provider: 'anthropic',
		isActive: true,
		pricePerInputTokenUsd: 0.000003,
		pricePerOutputTokenUsd: 0.000015,
	},
	{
		id: 'model-gemini',
		createdAt: 1000002,
		name: 'gemini-flash-2.5',
		provider: 'google',
		isActive: true,
		pricePerInputTokenUsd: 0.0000001,
		pricePerOutputTokenUsd: 0.0000004,
	},
];

const GLOBAL_SETTINGS: { key: string; value: unknown }[] = [
	{ key: 'globalWeeklyLimitUsd', value: 100 },
];

const adminUser = (id = createId()): User & { password?: string } => ({
	id,
	createdAt: 1000000,
	email: 'admin@example.com',
	role: 'ADMIN',
	status: 'active',
	allowedModelIds: ['model-opus', 'model-sonnet', 'model-gemini'],
	customLimitUsd: null,
	bifrostKeyId: 'bfk-admin-001',
	password: 'password',
});

const normalUser = (id = createId()): User & { password?: string } => ({
	id,
	createdAt: 1000001,
	email: 'user@example.com',
	role: 'USER',
	status: 'active',
	allowedModelIds: ['model-sonnet', 'model-gemini'],
	customLimitUsd: 20,
	bifrostKeyId: 'bfk-user-001',
	password: 'password',
});

const pendingUser = (id = createId()): User & { password?: string } => ({
	id,
	createdAt: 1000002,
	email: 'newuser@example.com',
	role: 'USER',
	status: 'pending',
	allowedModelIds: ['model-sonnet'],
	customLimitUsd: null,
	bifrostKeyId: 'bfk-pending-001',
	password: undefined,
});

const apiKeyFor = (userId: string, bifrostKeyId: string): ApiKey => ({
	userId,
	key: `sk-gateway-${bifrostKeyId}`,
	bifrostKeyId,
	createdAt: 1000000,
});

const usageFor = (userId: string, costUsd: number): UsageSummary => ({
	userId,
	weekStart: WEEK_START,
	totalCostUsd: costUsd,
	totalInputTokens: Math.round((costUsd * 0.8) / 0.000003),
	totalOutputTokens: Math.round((costUsd * 0.2) / 0.000015),
});

export type DatabaseShape = {
	session: { userId: string }[];
	users: (User & { password?: string })[];
	models: Model[];
	'api-keys': ApiKey[];
	usage: UsageSummary[];
	settings: { key: string; value: unknown }[];
};

export const localScenarioData = (scenario: LocalScenario): DatabaseShape => {
	const admin = adminUser('user-admin');
	const user = normalUser('user-normal');
	const pending = pendingUser('user-pending');

	const base = {
		models: MODELS,
		settings: GLOBAL_SETTINGS,
	};

	switch (scenario) {
		case 'empty':
			return { session: [], users: [], 'api-keys': [], usage: [], ...base };

		case 'logged-out':
			return {
				session: [],
				users: [admin, user],
				'api-keys': [apiKeyFor(admin.id, admin.bifrostKeyId), apiKeyFor(user.id, user.bifrostKeyId)],
				usage: [usageFor(admin.id, 12.5), usageFor(user.id, 7.2)],
				...base,
			};

		case 'normal-user':
			return {
				session: [{ userId: user.id }],
				users: [admin, user],
				'api-keys': [apiKeyFor(user.id, user.bifrostKeyId)],
				usage: [usageFor(user.id, 7.2)],
				...base,
			};

		case 'admin-user':
			return {
				session: [{ userId: admin.id }],
				users: [admin, user, pending],
				'api-keys': [
					apiKeyFor(admin.id, admin.bifrostKeyId),
					apiKeyFor(user.id, user.bifrostKeyId),
				],
				usage: [usageFor(admin.id, 12.5), usageFor(user.id, 7.2)],
				...base,
			};

		case 'pending-user':
			return {
				session: [],
				users: [pending],
				'api-keys': [],
				usage: [],
				...base,
			};

		case 'at-limit': {
			const limitedUser: User & { password?: string } = {
				...user,
				customLimitUsd: 20,
			};
			return {
				session: [{ userId: limitedUser.id }],
				users: [admin, limitedUser],
				'api-keys': [apiKeyFor(limitedUser.id, limitedUser.bifrostKeyId)],
				usage: [usageFor(limitedUser.id, 20)],
				...base,
			};
		}

		default:
			return { session: [], users: [], 'api-keys': [], usage: [], ...base };
	}
};
