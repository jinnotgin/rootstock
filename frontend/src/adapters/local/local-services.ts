import { nanoid } from 'nanoid';

import {
  FIXTURE_SETTINGS,
  FIXTURE_USERS,
} from './fixtures';

import { GlobalSettings, User } from '@/domain/types';
import { AuthPort, LoginInput } from '@/ports/auth';
import { SettingsPort } from '@/ports/settings';
import { CreateUserInput, UpdateUserInput, UsersPort } from '@/ports/users';

type StoredUser = User & { password: string };

class LocalAuthAdapter implements AuthPort {
  private sessionUserId: string | null = null;

  constructor(private readonly users: StoredUser[]) {}

  async getCurrentUser(): Promise<User | null> {
    if (!this.sessionUserId) return null;
    const user = this.users.find((u) => u.id === this.sessionUserId);
    if (!user) return null;
    const { password: _, ...rest } = user;
    return rest;
  }

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const user = this.users.find(
      (u) => u.email === input.email && u.password === input.password,
    );
    if (!user) throw new Error('Invalid email or password');
    this.sessionUserId = user.id;
    const { password: _, ...rest } = user;
    return { user: rest, token: btoa(JSON.stringify({ id: user.id })) };
  }

  async logout(): Promise<void> {
    this.sessionUserId = null;
  }
}

class LocalUsersAdapter implements UsersPort {
  constructor(private readonly users: StoredUser[]) {}

  async listUsers(): Promise<User[]> {
    return this.users.map(({ password: _, ...rest }) => rest);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const existing = this.users.find((u) => u.email === input.email);
    if (existing) throw new Error('A user with this email already exists');
    const user: StoredUser = {
      id: nanoid(),
      email: input.email,
      password: input.password,
      role: 'user',
      createdAt: new Date().toISOString(),
      keyId: null,
      assignedModels: input.assignedModels,
      customWeeklyLimit: input.customWeeklyLimit,
    };
    this.users.push(user);
    const { password: _, ...rest } = user;
    return rest;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = {
      ...this.users[idx],
      assignedModels: input.assignedModels,
      customWeeklyLimit: input.customWeeklyLimit,
    };
    const { password: _, ...rest } = this.users[idx];
    return rest;
  }

  async deleteUser(userId: string): Promise<void> {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    this.users.splice(idx, 1);
  }

  setKeyId(userId: string, keyId: string | null): void {
    const user = this.users.find((u) => u.id === userId);
    if (user) user.keyId = keyId;
  }
}

class LocalSettingsAdapter implements SettingsPort {
  private settings: GlobalSettings;

  constructor(initial: GlobalSettings) {
    this.settings = { ...initial };
  }

  async getSettings(): Promise<GlobalSettings> {
    return { ...this.settings };
  }

  async updateSettings(settings: GlobalSettings): Promise<GlobalSettings> {
    this.settings = { ...settings };
    return { ...this.settings };
  }
}

export type LocalServices = {
  auth: AuthPort;
  users: UsersPort & { setKeyId(userId: string, keyId: string | null): void };
  settings: SettingsPort;
};

export const makeLocalServices = (): LocalServices => {
  const users: StoredUser[] = FIXTURE_USERS.map((u) => ({ ...u }));
  const usersAdapter = new LocalUsersAdapter(users);
  return {
    auth: new LocalAuthAdapter(users),
    users: usersAdapter,
    settings: new LocalSettingsAdapter({ ...FIXTURE_SETTINGS }),
  };
};
