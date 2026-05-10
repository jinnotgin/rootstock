import { ModelSlug, User } from '@/domain/types';

export type CreateUserInput = {
  email: string;
  password: string;
  assignedModels: ModelSlug[];
  customWeeklyLimit: number | null;
};

export type UpdateUserInput = {
  assignedModels: ModelSlug[];
  customWeeklyLimit: number | null;
};

export interface UsersPort {
  listUsers(): Promise<User[]>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(userId: string, input: UpdateUserInput): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
