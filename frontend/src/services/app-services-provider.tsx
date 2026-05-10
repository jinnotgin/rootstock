import * as React from 'react';

import { AdminProvider } from '@/ports/admin';
import { AuthProvider } from '@/ports/auth';
import { GatewayProvider } from '@/ports/gateway';

export type AppServices = {
	auth: AuthProvider;
	gateway: GatewayProvider;
	admin: AdminProvider;
};

const AppServicesContext = React.createContext<AppServices | null>(null);

export const AppServicesProvider = ({
	children,
	value,
}: {
	children: React.ReactNode;
	value: AppServices;
}) => <AppServicesContext.Provider value={value}>{children}</AppServicesContext.Provider>;

export const useServices = () => {
	const services = React.useContext(AppServicesContext);
	if (!services) throw new Error('AppServicesProvider is missing');
	return services;
};
