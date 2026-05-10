import { GlobalSettings, User, UsageRecord, VirtualKey } from '@/domain/types';

export const FIXTURE_USERS: (User & { password: string })[] = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    keyId: null,
    assignedModels: [],
    customWeeklyLimit: null,
  },
  {
    id: 'user-1',
    email: 'alice@example.com',
    password: 'pass123',
    role: 'user',
    createdAt: '2026-01-10T00:00:00Z',
    keyId: 'key-1',
    assignedModels: ['claude-opus-4-6', 'claude-sonnet-4-6'],
    customWeeklyLimit: null,
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    password: 'pass123',
    role: 'user',
    createdAt: '2026-02-01T00:00:00Z',
    keyId: 'key-2',
    assignedModels: ['claude-sonnet-4-6', 'gemini-flash-2-5'],
    customWeeklyLimit: 500,
  },
  {
    id: 'user-3',
    email: 'carol@example.com',
    password: 'pass123',
    role: 'user',
    createdAt: '2026-03-15T00:00:00Z',
    keyId: 'key-3',
    assignedModels: ['gemini-flash-2-5'],
    customWeeklyLimit: 100,
  },
];

export const FIXTURE_KEYS: VirtualKey[] = [
  {
    id: 'key-1',
    userId: 'user-1',
    keyValue: 'sk-gw-alice-xxxxxxxxxxxxxxxx',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'key-2',
    userId: 'user-2',
    keyValue: 'sk-gw-bob-xxxxxxxxxxxxxxxx',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'key-3',
    userId: 'user-3',
    keyValue: 'sk-gw-carol-xxxxxxxxxxxxxxxx',
    createdAt: '2026-03-15T00:00:00Z',
  },
];

export const FIXTURE_USAGE: Record<string, UsageRecord> = {
  'key-1': {
    keyId: 'key-1',
    requestCount: 342,
    spendUsd: 8.53,
    weekStart: '2026-05-04',
  },
  'key-2': {
    keyId: 'key-2',
    requestCount: 487,
    spendUsd: 2.14,
    weekStart: '2026-05-04',
  },
  'key-3': {
    keyId: 'key-3',
    requestCount: 98,
    spendUsd: 0.31,
    weekStart: '2026-05-04',
  },
};

export const FIXTURE_SETTINGS: GlobalSettings = {
  weeklyRequestLimit: 1000,
};
