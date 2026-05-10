import { useQuery, queryOptions } from '@tanstack/react-query';

import { QueryConfig } from '@/lib/react-query';
import { DiscussionStore } from '@/ports';
import { useServices } from '@/services/app-services-provider';
import { Discussion } from '@/types/api';

export const getDiscussion = ({
  discussions,
  discussionId,
}: {
  discussions: DiscussionStore;
  discussionId: string;
}): Promise<{ data: Discussion }> => {
  return discussions.getDiscussion(discussionId);
};

export const getDiscussionQueryOptions = (
  discussions: DiscussionStore,
  discussionId: string,
) => {
  return queryOptions({
    queryKey: ['discussions', discussionId],
    queryFn: () => getDiscussion({ discussions, discussionId }),
  });
};

type UseDiscussionOptions = {
  discussionId: string;
  queryConfig?: QueryConfig<typeof getDiscussionQueryOptions>;
};

export const useDiscussion = ({
  discussionId,
  queryConfig,
}: UseDiscussionOptions) => {
  const { discussions } = useServices();

  return useQuery({
    ...getDiscussionQueryOptions(discussions, discussionId),
    ...queryConfig,
  });
};
