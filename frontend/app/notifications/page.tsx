'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function NotificationsRedirect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'LEARNER') {
      router.replace('/dashboard/learner/notifications');
    } else {
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, router]);

  return null;
}
