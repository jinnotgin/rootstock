import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main';
import { Notifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { AuthLoader } from '@/lib/auth';
import { queryConfig } from '@/lib/react-query';
import { AppServicesProvider } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [services] = React.useState(() => defaultServices);
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <HelmetProvider>
          <AppServicesProvider value={services}>
            <QueryClientProvider client={queryClient}>
              {import.meta.env.DEV && <ReactQueryDevtools />}
              <Notifications />
              <AuthLoader
                renderLoading={() => (
                  <div className="flex h-screen w-screen items-center justify-center">
                    <Spinner size="xl" />
                  </div>
                )}
              >
                {children}
              </AuthLoader>
            </QueryClientProvider>
          </AppServicesProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
