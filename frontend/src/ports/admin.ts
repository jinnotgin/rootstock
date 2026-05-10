import { Limits, Model, User } from '@/domain/types';

export type CreateUserInput = {
	email: string;
	role: 'ADMIN' | 'USER';
	allowedModelIds: string[];
	customLimitUsd: number | null;
};

export type UpdateUserInput = {
	allowedModelIds: string[];
	customLimitUsd: number | null;
};

export type UpdateModelInput = {
	isActive: boolean;
	pricePerInputTokenUsd: number;
	pricePerOutputTokenUsd: number;
};

export interface AdminProvider {
	listUsers(): Promise<User[]>;
	createUser(input: CreateUserInput): Promise<User>;
	updateUser(userId: string, input: UpdateUserInput): Promise<User>;
	deleteUser(userId: string): Promise<void>;
	listAllModels(): Promise<Model[]>;
	updateModel(modelId: string, input: UpdateModelInput): Promise<Model>;
	getGlobalLimits(): Promise<Limits>;
	updateGlobalLimits(input: Limits): Promise<Limits>;
}
