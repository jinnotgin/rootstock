import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/lib/react-query';
import { UserStore } from '@/ports';
import { useServices } from '@/services/app-services-provider';
import { User } from '@/types/api';

export const getUsers = (users: UserStore): Promise<{ data: User[] }> => {
  return users.listUsers();
};

export const getUsersQueryOptions = (users: UserStore) => {
  return queryOptions({
    queryKey: ['users'],
    queryFn: () => getUsers(users),
  });
};

type UseUsersOptions = {
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({ queryConfig }: UseUsersOptions = {}) => {
  const { users } = useServices();

  return useQuery({
    ...getUsersQueryOptions(users),
    ...queryConfig,
  });
};
