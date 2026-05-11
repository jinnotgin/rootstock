import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/services/app-services-provider';
import { CreateUserInput, UpdateModelInput, UpdateUserInput } from '@/ports/admin';
import { Limits } from '@/types/api';

export const usersQueryKey = ['admin', 'users'];
export const allModelsQueryKey = ['admin', 'models'];
export const globalLimitsQueryKey = ['admin', 'limits'];

export const useAdminUsers = () => {
	const { admin } = useServices();
	return useQuery({
		queryKey: usersQueryKey,
		queryFn: () => admin.listUsers(),
	});
};

export const useCreateUser = () => {
	const { admin } = useServices();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateUserInput) => admin.createUser(input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey }),
	});
};

export const useUpdateUser = () => {
	const { admin } = useServices();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
			admin.updateUser(userId, input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey }),
	});
};

export const useDeleteUser = () => {
	const { admin } = useServices();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: string) => admin.deleteUser(userId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey }),
	});
};

export const useAdminModels = () => {
	const { admin } = useServices();
	return useQuery({
		queryKey: allModelsQueryKey,
		queryFn: () => admin.listAllModels(),
	});
};

export const useUpdateModel = () => {
	const { admin } = useServices();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ modelId, input }: { modelId: string; input: UpdateModelInput }) =>
			admin.updateModel(modelId, input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: allModelsQueryKey }),
	});
};

export const useGlobalLimits = () => {
	const { admin } = useServices();
	return useQuery({
		queryKey: globalLimitsQueryKey,
		queryFn: () => admin.getGlobalLimits(),
	});
};

export const useUpdateGlobalLimits = () => {
	const { admin } = useServices();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: Limits) => admin.updateGlobalLimits(input),
		onSuccess: (data) => queryClient.setQueryData(globalLimitsQueryKey, data),
	});
};
