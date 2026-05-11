import { useUser } from '@/lib/auth';
import { ApiKeyCard } from '@/features/dashboard/components/api-key-card';
import { UsageSummaryCard } from '@/features/dashboard/components/usage-summary';
import { ModelList } from '@/features/dashboard/components/model-list';

export default function DashboardRoute() {
	const { data: user } = useUser();

	if (!user) return null;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<div className="grid gap-6 lg:grid-cols-2">
				<ApiKeyCard userId={user.id} />
				<UsageSummaryCard userId={user.id} limitUsd={user.customLimitUsd ?? 100} />
			</div>
			<ModelList userId={user.id} />
		</div>
	);
}
