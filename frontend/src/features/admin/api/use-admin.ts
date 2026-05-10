import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useServices } from '@/services/app-services-provider';
import { CreateUserInput, UpdateUserInput } from '@/ports/users';
import { GlobalSettings } from '@/domain/types';

export function useUsers() {
  const { users } = useServices();
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => users.listUsers(),
  });
}

export function useCreateUser() {
  const { users, gateway } = useServices();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const user = await users.createUser(input);
      const key = await gateway.createKey(user.id);
      users.setKeyId(user.id, key.id);
      return { user, key };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateUser() {
  const { users, gateway } = useServices();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      keyId,
      input,
    }: {
      userId: string;
      keyId: string | null;
      input: UpdateUserInput;
    }) => {
      const user = await users.updateUser(userId, input);
      if (keyId) {
        await gateway.updateKeyLimits(keyId, input.customWeeklyLimit);
      }
      return user;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const { users, gateway } = useServices();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, keyId }: { userId: string; keyId: string | null }) => {
      if (keyId) await gateway.deleteKey(keyId);
      await users.deleteUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSettings() {
  const { settings } = useServices();
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => settings.getSettings(),
  });
}

export function useUpdateSettings() {
  const { settings } = useServices();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: GlobalSettings) => settings.updateSettings(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
