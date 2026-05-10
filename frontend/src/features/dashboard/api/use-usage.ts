import { useQuery } from '@tanstack/react-query';

import { useCurrentUser } from '@/lib/auth';
import { useServices } from '@/services/app-services-provider';
import { UsageRecord } from '@/domain/types';

export function useUsage() {
  const user = useCurrentUser();
  const { gateway, settings } = useServices();

  const usageQuery = useQuery<UsageRecord | null>({
    queryKey: ['usage', user.keyId],
    queryFn: async () => {
      if (!user.keyId) return null;
      return gateway.getUsage(user.keyId);
    },
    enabled: !!user.keyId,
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: () => settings.getSettings(),
  });

  const weeklyLimit =
    user.customWeeklyLimit ?? settingsQuery.data?.weeklyRequestLimit ?? 1000;

  return { usageQuery, weeklyLimit };
}
