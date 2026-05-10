import { http, HttpResponse } from 'msw';

import { FIXTURE_USAGE } from '@/adapters/local/fixtures';
import { UsageRecord } from '@/domain/types';

const usage: Record<string, UsageRecord> = Object.fromEntries(
  Object.entries(FIXTURE_USAGE).map(([k, v]) => [k, { ...v }]),
);

export const usageHandlers = [
  http.get('/api/usage/:keyId', ({ params }) => {
    const { keyId } = params as { keyId: string };
    const record = usage[keyId];
    if (!record) {
      const empty: UsageRecord = {
        keyId,
        requestCount: 0,
        spendUsd: 0,
        weekStart: new Date().toISOString().slice(0, 10),
      };
      return HttpResponse.json(empty);
    }
    return HttpResponse.json(record);
  }),
];
