import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { useAuth } from '@/lib/auth';
import { paths } from '@/config/paths';

export function LoginPage() {
  const { state, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === 'authenticated') {
      navigate(
        state.user.role === 'admin' ? paths.app.admin : paths.app.dashboard,
        { replace: true },
      );
    }
  }, [state, navigate]);

  if (state.status === 'loading') return null;

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLogin} />
    </AuthLayout>
  );
}
