import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { useUsage } from '../api/use-usage';

export function UsageCard() {
  const { usageQuery, weeklyLimit } = useUsage();
  const usage = usageQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage This Week</CardTitle>
      </CardHeader>
      <CardContent>
        {usageQuery.isLoading && <Spinner />}
        {!usageQuery.isLoading && !usage && (
          <p className="text-sm text-gray-500">No usage data available.</p>
        )}
        {usage && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-end justify-between">
                <span className="text-sm font-medium text-gray-700">Requests</span>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {usage.requestCount.toLocaleString()}
                  </span>
                  {' / '}
                  {weeklyLimit.toLocaleString()}
                </span>
              </div>
              <Progress value={usage.requestCount} max={weeklyLimit} />
            </div>
            <div className="rounded-md bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Estimated spend this week</p>
              <p className="mt-0.5 text-lg font-semibold text-gray-900">
                ${usage.spendUsd.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Week starting {usage.weekStart}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
