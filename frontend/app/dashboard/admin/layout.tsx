'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useRequireAuth } from '@/common/hooks/useRequireAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useRequireAuth(['ADMIN']);
  if (!user) return null;
  return (
    <DashboardShell role="ADMIN" title="Admin">
      {children}
    </DashboardShell>
  );
}
