import { Outlet } from 'react-router';

import { AppLayout } from '@/components/layouts/app-layout';

export default function AppRoot() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}

export function ErrorBoundary() {
	return (
		<div className="flex h-full items-center justify-center p-8">
			<p className="text-destructive">Something went wrong. Please try refreshing.</p>
		</div>
	);
}
