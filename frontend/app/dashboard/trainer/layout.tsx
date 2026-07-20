'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useRequireAuth } from '@/common/hooks/useRequireAuth';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useRequireAuth(['TRAINER']);
  if (!user) return null;
  return (
    <DashboardShell role="TRAINER" title="Trainer">
      {children}
    </DashboardShell>
  );
}
