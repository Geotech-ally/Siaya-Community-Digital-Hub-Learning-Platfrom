'use client';

import { UserSettingsPanel } from '@/components/settings/UserSettingsPanel';

export default function LearnerSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Manage your notifications, profile visibility, and preferences.</p>
      </div>
      <UserSettingsPanel />
    </div>
  );
}
