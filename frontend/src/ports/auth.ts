import { AuthResponse, User } from '@/domain/types';

export type LoginInput = {
	email: string;
	password: string;
};

export type SetPasswordInput = {
	email: string;
	password: string;
};

export interface AuthProvider {
	getCurrentUser(): Promise<User | null>;
	login(input: LoginInput): Promise<AuthResponse>;
	setPassword(input: SetPasswordInput): Promise<AuthResponse>;
	logout(): Promise<void>;
}
