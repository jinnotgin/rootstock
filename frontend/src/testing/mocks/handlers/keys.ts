import { nanoid } from 'nanoid';
import { http, HttpResponse } from 'msw';

import { FIXTURE_KEYS, FIXTURE_USAGE } from '@/adapters/local/fixtures';
import { UsageRecord, VirtualKey } from '@/domain/types';

const keys: VirtualKey[] = FIXTURE_KEYS.map((k) => ({ ...k }));
const usage: Record<string, UsageRecord> = Object.fromEntries(
  Object.entries(FIXTURE_USAGE).map(([k, v]) => [k, { ...v }]),
);

export const keyHandlers = [
  http.post('/api/keys', async ({ request }) => {
    const body = (await request.json()) as { userId: string };
    const key: VirtualKey = {
      id: `key-${nanoid(8)}`,
      userId: body.userId,
      keyValue: `sk-gw-${nanoid(16)}`,
      createdAt: new Date().toISOString(),
    };
    keys.push(key);
    usage[key.id] = {
      keyId: key.id,
      requestCount: 0,
      spendUsd: 0,
      weekStart: new Date().toISOString().slice(0, 10),
    };
    return HttpResponse.json(key, { status: 201 });
  }),

  http.post('/api/keys/:keyId/rotate', ({ params }) => {
    const { keyId } = params as { keyId: string };
    const idx = keys.findIndex((k) => k.id === keyId);
    if (idx === -1) return HttpResponse.json({ message: 'Key not found' }, { status: 404 });
    keys[idx] = {
      ...keys[idx],
      keyValue: `sk-gw-${nanoid(16)}`,
    };
    return HttpResponse.json(keys[idx]);
  }),

  http.delete('/api/keys/:keyId', ({ params }) => {
    const { keyId } = params as { keyId: string };
    const idx = keys.findIndex((k) => k.id === keyId);
    if (idx === -1) return HttpResponse.json({ message: 'Key not found' }, { status: 404 });
    keys.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/keys/:keyId', async ({ params, request }) => {
    const { keyId } = params as { keyId: string };
    const key = keys.find((k) => k.id === keyId);
    if (!key) return HttpResponse.json({ message: 'Key not found' }, { status: 404 });
    await request.json();
    return HttpResponse.json(key);
  }),
];
