export type BaseEntity = {
	id: string;
	createdAt: number;
};

export type Entity<T> = { [K in keyof T]: T[K] } & BaseEntity;

export type User = Entity<{
	email: string;
	role: 'ADMIN' | 'USER';
	status: 'active' | 'pending';
	allowedModelIds: string[];
	customLimitUsd: number | null;
	bifrostKeyId: string;
}>;

export type AuthResponse = {
	token: string;
	user: User;
};

export type ApiKey = {
	userId: string;
	key: string;
	bifrostKeyId: string;
	createdAt: number;
};

export type Model = Entity<{
	name: string;
	provider: 'anthropic' | 'google';
	isActive: boolean;
	pricePerInputTokenUsd: number;
	pricePerOutputTokenUsd: number;
}>;

export type UsageSummary = {
	userId: string;
	weekStart: string;
	totalCostUsd: number;
	totalInputTokens: number;
	totalOutputTokens: number;
};

export type Limits = {
	globalWeeklyLimitUsd: number;
};
