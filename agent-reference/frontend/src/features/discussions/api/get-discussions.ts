import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/lib/react-query';
import { DiscussionStore } from '@/ports';
import { useServices } from '@/services/app-services-provider';
import { Discussion, Meta } from '@/types/api';

export const getDiscussions = (
	discussions: DiscussionStore,
	page = 1,
): Promise<{
	data: Discussion[];
	meta: Meta;
}> => {
	return discussions.listDiscussions(page);
};

export const getDiscussionsQueryOptions = ({
	discussions,
	page,
}: {
	discussions: DiscussionStore;
	page?: number;
}) => {
	return queryOptions({
		queryKey: page ? ['discussions', { page }] : ['discussions'],
		queryFn: () => getDiscussions(discussions, page),
	});
};

type UseDiscussionsOptions = {
	page?: number;
	queryConfig?: QueryConfig<typeof getDiscussionsQueryOptions>;
};

export const useDiscussions = ({
	queryConfig,
	page,
}: UseDiscussionsOptions) => {
	const { discussions } = useServices();

	return useQuery({
		...getDiscussionsQueryOptions({ discussions, page }),
		...queryConfig,
	});
};
