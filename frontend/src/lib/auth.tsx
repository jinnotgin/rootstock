import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { User } from '@/domain/types';
import { useServices } from '@/services/app-services-provider';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User };

type AuthContextValue = {
  state: AuthState;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useServices();
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    auth.getCurrentUser().then((user) => {
      setState(
        user ? { status: 'authenticated', user } : { status: 'unauthenticated' },
      );
    });
  }, [auth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user } = await auth.login({ email, password });
      setState({ status: 'authenticated', user });
    },
    [auth],
  );

  const logout = useCallback(async () => {
    await auth.logout();
    setState({ status: 'unauthenticated' });
  }, [auth]);

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useCurrentUser(): User {
  const { state } = useAuth();
  if (state.status !== 'authenticated') throw new Error('Not authenticated');
  return state.user;
}
