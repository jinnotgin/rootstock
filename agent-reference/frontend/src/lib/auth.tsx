import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { paths } from '@/config/paths';
import { useServices } from '@/services/app-services-provider';
import { AuthResponse, User } from '@/types/api';

export const authQueryKey = ['auth', 'user'];

export const loginInputSchema = z.object({
	email: z.string().min(1, 'Required').email('Invalid email'),
	password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z
	.object({
		email: z.string().min(1, 'Required'),
		firstName: z.string().min(1, 'Required'),
		lastName: z.string().min(1, 'Required'),
		password: z.string().min(5, 'Required'),
	})
	.and(
		z
			.object({
				teamId: z.string().min(1, 'Required'),
				teamName: z.null().default(null),
			})
			.or(
				z.object({
					teamName: z.string().min(1, 'Required'),
					teamId: z.null().default(null),
				}),
			),
	);

export type RegisterInput = z.infer<typeof registerInputSchema>;

type MutationCallbacks<TData, TVariables> = {
	onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
	onError?: (error: Error, variables: TVariables, context: unknown) => void;
};

export const useUser = () => {
	const { auth } = useServices();

	return useQuery({
		queryKey: authQueryKey,
		queryFn: auth.getCurrentUser.bind(auth),
		retry: false,
	});
};

export const useLogin = (options: MutationCallbacks<User, LoginInput> = {}) => {
	const { auth } = useServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: LoginInput) => {
			const response: AuthResponse = await auth.login(data);
			return response.user;
		},
		onSuccess: (user, variables, context) => {
			queryClient.setQueryData(authQueryKey, user);
			options.onSuccess?.(user, variables, context);
		},
		onError: options.onError,
	});
};

export const useRegister = (
	options: MutationCallbacks<User, RegisterInput> = {},
) => {
	const { auth } = useServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: RegisterInput) => {
			const response: AuthResponse = await auth.register(data);
			return response.user;
		},
		onSuccess: (user, variables, context) => {
			queryClient.setQueryData(authQueryKey, user);
			options.onSuccess?.(user, variables, context);
		},
		onError: options.onError,
	});
};

export const useLogout = (options: MutationCallbacks<void, unknown> = {}) => {
	const { auth } = useServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => auth.logout(),
		onSuccess: (data, variables, context) => {
			queryClient.setQueryData(authQueryKey, null);
			queryClient.clear();
			options.onSuccess?.(data, variables, context);
		},
		onError: options.onError,
	});
};

export const AuthLoader = ({
	children,
	renderLoading,
}: {
	children: React.ReactNode;
	renderLoading: () => React.ReactNode;
}) => {
	const user = useUser();

	if (user.isLoading) {
		return <>{renderLoading()}</>;
	}

	return <>{children}</>;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const user = useUser();
	const location = useLocation();

	if (!user.data) {
		return (
			<Navigate to={paths.auth.login.getHref(location.pathname)} replace />
		);
	}

	return children;
};
