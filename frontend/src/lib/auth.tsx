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
	password: z.string().min(1, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const setPasswordInputSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string().min(1, 'Required'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>;

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

export const useSetPassword = (
	options: MutationCallbacks<User, { email: string; password: string }> = {},
) => {
	const { auth } = useServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { email: string; password: string }) => {
			const response: AuthResponse = await auth.setPassword(data);
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
	if (user.isLoading) return <>{renderLoading()}</>;
	return <>{children}</>;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const user = useUser();
	const location = useLocation();

	if (!user.data) {
		return <Navigate to={paths.auth.login.getHref(location.pathname)} replace />;
	}

	return children;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
	const user = useUser();

	if (!user.data) {
		return <Navigate to={paths.auth.login.getHref()} replace />;
	}

	if (user.data.role !== 'ADMIN') {
		return <Navigate to={paths.app.dashboard.getHref()} replace />;
	}

	return children;
};
