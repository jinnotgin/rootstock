import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationConfig } from '@/lib/react-query';
import { useServices } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';

import { getDiscussionsQueryOptions } from './get-discussions';

export const deleteDiscussion = ({
	discussionId,
}: {
	discussionId: string;
}) => {
	return defaultServices.discussions.deleteDiscussion(discussionId);
};

type UseDeleteDiscussionOptions = {
	mutationConfig?: MutationConfig<typeof deleteDiscussion>;
};

export const useDeleteDiscussion = ({
	mutationConfig,
}: UseDeleteDiscussionOptions = {}) => {
	const { discussions } = useServices();
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getDiscussionsQueryOptions({ discussions }).queryKey,
			});
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: ({ discussionId }) =>
			discussions.deleteDiscussion(discussionId),
	});
};
