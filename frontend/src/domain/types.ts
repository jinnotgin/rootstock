export type UserRole = 'admin' | 'user';

export type ModelSlug =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'gemini-flash-2-5';

export type Model = {
  slug: ModelSlug;
  name: string;
};

export const ALL_MODELS: Model[] = [
  { slug: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
  { slug: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
  { slug: 'gemini-flash-2-5', name: 'Gemini Flash 2.5' },
];

export type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  keyId: string | null;
  assignedModels: ModelSlug[];
  customWeeklyLimit: number | null;
};

export type VirtualKey = {
  id: string;
  userId: string;
  keyValue: string;
  createdAt: string;
};

export type UsageRecord = {
  keyId: string;
  requestCount: number;
  spendUsd: number;
  weekStart: string;
};

export type GlobalSettings = {
  weeklyRequestLimit: number;
};
