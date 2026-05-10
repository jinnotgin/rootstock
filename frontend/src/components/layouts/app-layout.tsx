import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';

import { useAuth, useCurrentUser } from '@/lib/auth';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';

function NavBar() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(paths.auth.login);
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-base font-semibold text-gray-900">API Gateway</span>
          {user.role === 'admin' && (
            <Link
              to={paths.app.admin}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Admin
            </Link>
          )}
          {user.role === 'user' && (
            <Link
              to={paths.app.dashboard}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
