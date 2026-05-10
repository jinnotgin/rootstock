import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

import { queryClient } from '@/lib/react-query';
import { AppServicesProvider, AppServices } from '@/services/app-services-provider';
import { AuthProvider } from '@/lib/auth';

type AppProviderProps = {
  services: AppServices;
  children: ReactNode;
};

export function AppProvider({ services, children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppServicesProvider services={services}>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </AppServicesProvider>
    </QueryClientProvider>
  );
}
