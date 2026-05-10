import { createContext, useContext, type ReactNode } from 'react';

import { AuthPort } from '@/ports/auth';
import { GatewayPort } from '@/ports/gateway';
import { SettingsPort } from '@/ports/settings';
import { UsersPort } from '@/ports/users';

export type AppServices = {
  auth: AuthPort;
  users: UsersPort & { setKeyId(userId: string, keyId: string | null): void };
  gateway: GatewayPort;
  settings: SettingsPort;
};

const AppServicesContext = createContext<AppServices | null>(null);

export function AppServicesProvider({
  services,
  children,
}: {
  services: AppServices;
  children: ReactNode;
}) {
  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function useServices(): AppServices {
  const ctx = useContext(AppServicesContext);
  if (!ctx) throw new Error('useServices must be used within AppServicesProvider');
  return ctx;
}
