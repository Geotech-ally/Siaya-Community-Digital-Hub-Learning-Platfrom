'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

// Generic entry point that forwards to the role-appropriate certificates view.
export default function CertificatesRedirect() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    router.replace(`/dashboard/${user.role.toLowerCase()}/certificates`);
  }, [user, router]);

  return null;
}
