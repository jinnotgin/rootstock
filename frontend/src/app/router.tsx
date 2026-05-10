import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { paths } from '@/config/paths';
import { AdminRoute, ProtectedRoute } from '@/lib/auth';

import AppRoot, { ErrorBoundary as AppRootErrorBoundary } from './routes/app/root';

const convert = (queryClient: QueryClient) => (m: any) => {
	const { clientLoader, clientAction, default: Component, ...rest } = m;
	return {
		...rest,
		loader: clientLoader?.(queryClient),
		action: clientAction?.(queryClient),
		Component,
	};
};

export const createAppRouter = (queryClient: QueryClient) =>
	createBrowserRouter([
		{
			path: paths.home.path,
			element: <Navigate to={paths.app.dashboard.getHref()} replace />,
		},
		{
			path: paths.auth.login.path,
			lazy: () => import('./routes/auth/login').then(convert(queryClient)),
		},
		{
			path: paths.auth.setPassword.path,
			lazy: () => import('./routes/auth/set-password').then(convert(queryClient)),
		},
		{
			path: paths.app.root.path,
			element: (
				<ProtectedRoute>
					<AppRoot />
				</ProtectedRoute>
			),
			ErrorBoundary: AppRootErrorBoundary,
			children: [
				{
					path: paths.app.dashboard.path,
					lazy: () => import('./routes/app/dashboard').then(convert(queryClient)),
				},
				{
					path: paths.app.admin.root.path,
					element: <AdminRoute><Outlet /></AdminRoute>,
					children: [
						{
							path: paths.app.admin.users.path,
							lazy: () => import('./routes/app/admin/users').then(convert(queryClient)),
						},
						{
							path: paths.app.admin.models.path,
							lazy: () => import('./routes/app/admin/models').then(convert(queryClient)),
						},
						{
							path: paths.app.admin.limits.path,
							lazy: () => import('./routes/app/admin/limits').then(convert(queryClient)),
						},
					],
				},
			],
		},
		{
			path: '*',
			lazy: () => import('./routes/not-found').then(convert(queryClient)),
		},
	]);

export const AppRouter = () => {
	const queryClient = useQueryClient();
	const router = useMemo(() => createAppRouter(queryClient), [queryClient]);
	return <RouterProvider router={router} />;
};
