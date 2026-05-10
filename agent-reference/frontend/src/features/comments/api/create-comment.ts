import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { MutationConfig } from '@/lib/react-query';
import { useServices } from '@/services/app-services-provider';
import { defaultServices } from '@/services/bootstrap/services';
import { Comment } from '@/types/api';

import { getInfiniteCommentsQueryOptions } from './get-comments';

export const createCommentInputSchema = z.object({
	discussionId: z.string().min(1, 'Required'),
	body: z.string().min(1, 'Required'),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

export const createComment = ({
	data,
}: {
	data: CreateCommentInput;
}): Promise<Comment> => {
	return defaultServices.comments.createComment(data);
};

type UseCreateCommentOptions = {
	discussionId: string;
	mutationConfig?: MutationConfig<typeof createComment>;
};

export const useCreateComment = ({
	mutationConfig,
	discussionId,
}: UseCreateCommentOptions) => {
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
		mutationFn: ({ data }) => comments.createComment(data),
	});
};
