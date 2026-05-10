import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MutationConfig } from '@/lib/react-query';
import { useServices } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';

import { getInfiniteCommentsQueryOptions } from './get-comments';

export const deleteComment = ({ commentId }: { commentId: string }) => {
	return defaultServices.comments.deleteComment(commentId);
};

type UseDeleteCommentOptions = {
	discussionId: string;
	mutationConfig?: MutationConfig<typeof deleteComment>;
};

export const useDeleteComment = ({
	mutationConfig,
	discussionId,
}: UseDeleteCommentOptions) => {
	const { comments } = useServices();
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getInfiniteCommentsQueryOptions(comments, discussionId)
					.queryKey,
			});
			onSuccess?.(...args);
		},
		...restConfig,
		mutationFn: ({ commentId }) => comments.deleteComment(commentId),
	});
};
