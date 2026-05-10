import { AuthResponse, User } from '@/domain/types';

export type LoginInput = {
	email: string;
	password: string;
};

export type RegisterInput = {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	teamId?: string | null;
	teamName?: string | null;
};

export interface AuthProvider {
	getCurrentUser(): Promise<User | null>;
	login(input: LoginInput): Promise<AuthResponse>;
	register(input: RegisterInput): Promise<AuthResponse>;
	logout(): Promise<void>;
}
