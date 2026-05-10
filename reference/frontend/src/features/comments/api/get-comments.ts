import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/lib/react-query';
import { CommentStore } from '@/ports';
import { useServices } from '@/services/app-services-provider';
import { Comment, Meta } from '@/types/api';

export const getComments = ({
  comments,
  discussionId,
  page = 1,
}: {
  comments: CommentStore;
  discussionId: string;
  page?: number;
}): Promise<{ data: Comment[]; meta: Meta }> => {
  return comments.listComments({ discussionId, page });
};

export const getInfiniteCommentsQueryOptions = (
  comments: CommentStore,
  discussionId: string,
) => {
  return infiniteQueryOptions({
    queryKey: ['comments', discussionId],
    queryFn: ({ pageParam = 1 }) => {
      return getComments({
        comments,
        discussionId,
        page: pageParam as number,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.meta?.page === lastPage?.meta?.totalPages) return undefined;
      const nextPage = lastPage.meta.page + 1;
      return nextPage;
    },
    initialPageParam: 1,
  });
};

type UseCommentsOptions = {
  discussionId: string;
  page?: number;
  queryConfig?: QueryConfig<typeof getComments>;
};

export const useInfiniteComments = ({ discussionId }: UseCommentsOptions) => {
  const { comments } = useServices();

  return useInfiniteQuery({
    ...getInfiniteCommentsQueryOptions(comments, discussionId),
  });
};
