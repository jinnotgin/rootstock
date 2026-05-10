import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationConfig } from '@/lib/react-query';
import { useServices } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';

import { getUsersQueryOptions } from './get-users';

export type DeleteUserDTO = {
  userId: string;
};

export const deleteUser = ({ userId }: DeleteUserDTO) => {
  return defaultServices.users.deleteUser(userId);
};

type UseDeleteUserOptions = {
  mutationConfig?: MutationConfig<typeof deleteUser>;
};

export const useDeleteUser = ({
  mutationConfig,
}: UseDeleteUserOptions = {}) => {
  const { users } = useServices();
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUsersQueryOptions(users).queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: ({ userId }) => users.deleteUser(userId),
  });
};
