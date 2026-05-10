import { ApiKeyCard } from '@/features/dashboard/components/api-key-card';
import { ModelsCard } from '@/features/dashboard/components/models-card';
import { UsageCard } from '@/features/dashboard/components/usage-card';

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ApiKeyCard />
        </div>
        <ModelsCard />
        <UsageCard />
      </div>
    </div>
  );
}
