import { randEmail, randNumber, randUuid } from '@ngneat/falso';

import { ApiKey, Limits, Model, User, UsageSummary } from '@/domain/types';

const generateUser = (): User => ({
	id: randUuid(),
	createdAt: Date.now(),
	email: randEmail(),
	role: 'USER',
	status: 'active',
	allowedModelIds: ['model-sonnet'],
	customLimitUsd: null,
	bifrostKeyId: `bfk-${randUuid()}`,
});

export const createUser = <T extends Partial<User>>(overrides?: T) => ({
	...generateUser(),
	...overrides,
});

export const createApiKey = (userId: string, bifrostKeyId: string): ApiKey => ({
	userId,
	key: `sk-gateway-${randUuid()}`,
	bifrostKeyId,
	createdAt: Date.now(),
});

export const createModel = <T extends Partial<Model>>(overrides?: T): Model => ({
	id: randUuid(),
	createdAt: Date.now(),
	name: 'claude-sonnet-4-6',
	provider: 'anthropic',
	isActive: true,
	pricePerInputTokenUsd: 0.000003,
	pricePerOutputTokenUsd: 0.000015,
	...overrides,
});

export const createUsage = (userId: string, weekStart: string, overrides?: Partial<UsageSummary>): UsageSummary => ({
	userId,
	weekStart,
	totalCostUsd: randNumber({ min: 0, max: 50, fraction: 2 }),
	totalInputTokens: randNumber({ min: 0, max: 1000000 }),
	totalOutputTokens: randNumber({ min: 0, max: 200000 }),
	...overrides,
});

export const createLimits = (overrides?: Partial<Limits>): Limits => ({
	globalWeeklyLimitUsd: 100,
	...overrides,
});
