import { Navigate, Outlet, Route, Routes } from 'react-router';

import { useAuth } from '@/lib/auth';
import { paths } from '@/config/paths';
import { Spinner } from '@/components/ui/spinner';
import { AppLayout } from '@/components/layouts/app-layout';

import { LoginPage } from './routes/auth/login';
import { DashboardPage } from './routes/app/dashboard';
import { AdminPage } from './routes/app/admin';
import { NotFoundPage } from './routes/not-found';

function RequireAuth({ role }: { role?: 'admin' | 'user' }) {
  const { state } = useAuth();

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (state.status === 'unauthenticated') {
    return <Navigate to={paths.auth.login} replace />;
  }

  if (role && state.user.role !== role) {
    return (
      <Navigate
        to={state.user.role === 'admin' ? paths.app.admin : paths.app.dashboard}
        replace
      />
    );
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={paths.auth.login} element={<LoginPage />} />

      <Route element={<RequireAuth role="user" />}>
        <Route path={paths.app.dashboard} element={<DashboardPage />} />
      </Route>

      <Route element={<RequireAuth role="admin" />}>
        <Route path={paths.app.admin} element={<AdminPage />} />
      </Route>

      <Route path="/" element={<Navigate to={paths.auth.login} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
