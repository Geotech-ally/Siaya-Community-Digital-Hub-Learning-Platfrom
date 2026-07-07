'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function AnalyticsRedirect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'ADMIN') router.replace('/dashboard/admin/analytics');
    else if (user.role === 'TRAINER') router.replace('/dashboard/trainer');
    else router.replace('/dashboard/learner/progress');
  }, [user, router]);

  return null;
}
