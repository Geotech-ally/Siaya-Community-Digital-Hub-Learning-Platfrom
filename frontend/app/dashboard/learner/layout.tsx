'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useRequireAuth } from '@/common/hooks/useRequireAuth';

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useRequireAuth(['LEARNER']);
  if (!user) return null;
  return (
    <DashboardShell role="LEARNER" title="Learner">
      {children}
    </DashboardShell>
  );
}
