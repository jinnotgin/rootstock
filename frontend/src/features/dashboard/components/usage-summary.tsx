import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useUsage } from '@/lib/gateway';
import { cn } from '@/lib/utils';

type Props = { userId: string; limitUsd: number };

const fmt = (usd: number) =>
	usd.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const fmtTokens = (n: number) =>
	n >= 1_000_000
		? `${(n / 1_000_000).toFixed(1)}M`
		: n >= 1_000
		? `${(n / 1_000).toFixed(1)}K`
		: `${n}`;

export const UsageSummaryCard = ({ userId, limitUsd }: Props) => {
	const usage = useUsage(userId);
	const costUsd = usage.data?.totalCostUsd ?? 0;
	const pct = Math.min(100, Math.round((costUsd / limitUsd) * 100));
	const totalTokens = (usage.data?.totalInputTokens ?? 0) + (usage.data?.totalOutputTokens ?? 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Weekly Usage</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{usage.isLoading ? (
					<div className="flex items-center gap-2 text-muted-foreground">
						<Spinner size="sm" />
						<span>Loading…</span>
					</div>
				) : (
					<>
						<div className="flex items-end justify-between">
							<span className="text-3xl font-bold">{fmt(costUsd)}</span>
							<span className="text-sm text-muted-foreground">of {fmt(limitUsd)} limit</span>
						</div>

						<Progress
							value={pct}
							aria-valuenow={pct}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label="Weekly spend progress"
							className={cn(pct >= 100 && '[&>[data-slot=progress-indicator]]:bg-destructive')}
						/>

						<p className="text-sm text-muted-foreground">
							{fmtTokens(totalTokens)} tokens this week
						</p>
					</>
				)}
			</CardContent>
		</Card>
	);
};
