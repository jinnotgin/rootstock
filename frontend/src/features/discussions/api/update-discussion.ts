import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { MutationConfig } from '@/lib/react-query';
import { useServices } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';
import { Discussion } from '@/types/api';

import { getDiscussionQueryOptions } from './get-discussion';

export const updateDiscussionInputSchema = z.object({
  title: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
});

export type UpdateDiscussionInput = z.infer<typeof updateDiscussionInputSchema>;

export const updateDiscussion = ({
  data,
  discussionId,
}: {
  data: UpdateDiscussionInput;
  discussionId: string;
}): Promise<Discussion> => {
  return defaultServices.discussions.updateDiscussion(discussionId, data);
};

type UseUpdateDiscussionOptions = {
  mutationConfig?: MutationConfig<typeof updateDiscussion>;
};

export const useUpdateDiscussion = ({
  mutationConfig,
}: UseUpdateDiscussionOptions = {}) => {
  const { discussions } = useServices();
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getDiscussionQueryOptions(discussions, data.id).queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: ({ data, discussionId }) =>
      discussions.updateDiscussion(discussionId, data),
  });
};
