import Link from 'next/link';
import { PlatformLogo } from '@/components/layout/PlatformLogo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-subtle px-6 text-center">
      <PlatformLogo size="lg" />
      <h1 className="font-display text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link href="/login" className="text-sm font-medium text-brand-600 hover:underline">
        Go to sign in
      </Link>
    </div>
  );
}
