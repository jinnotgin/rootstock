import { useState } from 'react';
import { cn } from '@/utils/cn';
import { ModelsTab } from '@/features/admin/components/models-tab';
import { SettingsTab } from '@/features/admin/components/settings-tab';
import { UsersTab } from '@/features/admin/components/users-tab';

type Tab = 'users' | 'models' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'models', label: 'Models' },
  { id: 'settings', label: 'Global Settings' },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'models' && <ModelsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
