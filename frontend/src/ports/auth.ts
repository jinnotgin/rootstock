import { User } from '@/domain/types';

export type LoginInput = {
  email: string;
  password: string;
};

export interface AuthPort {
  getCurrentUser(): Promise<User | null>;
  login(input: LoginInput): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
}
