import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/lib/auth';
import { useServices } from '@/services/app-services-provider';
import { FIXTURE_KEYS } from '@/adapters/local/fixtures';
import { VirtualKey } from '@/domain/types';

export function useVirtualKey() {
  const user = useCurrentUser();
  const { gateway } = useServices();

  return useQuery<VirtualKey | null>({
    queryKey: ['virtual-key', user.keyId],
    queryFn: async () => {
      if (!user.keyId) return null;
      const fixture = FIXTURE_KEYS.find((k) => k.id === user.keyId);
      return fixture ?? null;
    },
    enabled: !!user.keyId,
  });
}

export function useRotateKey() {
  const user = useCurrentUser();
  const { gateway } = useServices();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!user.keyId) throw new Error('No key to rotate');
      return gateway.rotateKey(user.keyId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['virtual-key', user.keyId] });
    },
  });
}
