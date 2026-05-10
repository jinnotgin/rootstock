import { ApiKey, Model, UsageSummary } from '@/domain/types';

export interface GatewayProvider {
	getApiKey(userId: string): Promise<ApiKey>;
	rotateApiKey(userId: string): Promise<ApiKey>;
	getUsage(userId: string, weekStart: string): Promise<UsageSummary>;
	listModels(userId: string): Promise<Model[]>;
}
