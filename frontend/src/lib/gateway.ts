import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/services/app-services-provider';
import { currentWeekStart } from '@/adapters/local/local-services';

export const apiKeyQueryKey = (userId: string) => ['gateway', 'api-key', userId];
export const usageQueryKey = (userId: string, weekStart: string) => ['gateway', 'usage', userId, weekStart];
export const modelsQueryKey = (userId: string) => ['gateway', 'models', userId];

export const useApiKey = (userId: string) => {
	const { gateway } = useServices();
	return useQuery({
		queryKey: apiKeyQueryKey(userId),
		queryFn: () => gateway.getApiKey(userId),
	});
};

export const useRotateApiKey = (userId: string) => {
	const { gateway } = useServices();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => gateway.rotateApiKey(userId),
		onSuccess: (newKey) => {
			queryClient.setQueryData(apiKeyQueryKey(userId), newKey);
		},
	});
};

export const useUsage = (userId: string) => {
	const { gateway } = useServices();
	const weekStart = currentWeekStart();
	return useQuery({
		queryKey: usageQueryKey(userId, weekStart),
		queryFn: () => gateway.getUsage(userId, weekStart),
	});
};

export const useModels = (userId: string) => {
	const { gateway } = useServices();
	return useQuery({
		queryKey: modelsQueryKey(userId),
		queryFn: () => gateway.listModels(userId),
	});
};
