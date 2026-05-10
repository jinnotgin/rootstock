import { queryOptions, useQuery } from '@tanstack/react-query';

import { QueryConfig } from '@/lib/react-query';
import { TeamStore } from '@/ports';
import { useServices } from '@/services/app-services-provider';
import { Team } from '@/types/api';

export const getTeams = (teams: TeamStore): Promise<{ data: Team[] }> => {
	return teams.listTeams();
};

export const getTeamsQueryOptions = (teams: TeamStore) => {
	return queryOptions({
		queryKey: ['teams'],
		queryFn: () => getTeams(teams),
	});
};

type UseTeamsOptions = {
	queryConfig?: QueryConfig<typeof getTeamsQueryOptions>;
};

export const useTeams = ({ queryConfig = {} }: UseTeamsOptions = {}) => {
	const { teams } = useServices();

	return useQuery({
		...getTeamsQueryOptions(teams),
		...queryConfig,
	});
};
