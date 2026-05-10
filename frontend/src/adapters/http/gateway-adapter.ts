import { UsageRecord, VirtualKey } from '@/domain/types';
import { GatewayPort } from '@/ports/gateway';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export class HttpGatewayAdapter implements GatewayPort {
  async createKey(userId: string): Promise<VirtualKey> {
    return apiFetch<VirtualKey>('/keys', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async rotateKey(keyId: string): Promise<VirtualKey> {
    return apiFetch<VirtualKey>(`/keys/${keyId}/rotate`, { method: 'POST' });
  }

  async deleteKey(keyId: string): Promise<void> {
    await apiFetch(`/keys/${keyId}`, { method: 'DELETE' });
  }

  async updateKeyLimits(keyId: string, weeklyLimit: number | null): Promise<void> {
    await apiFetch(`/keys/${keyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ weeklyLimit }),
    });
  }

  async getUsage(keyId: string): Promise<UsageRecord> {
    return apiFetch<UsageRecord>(`/usage/${keyId}?period=week`);
  }
}
