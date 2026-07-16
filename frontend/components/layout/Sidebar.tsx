'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/types';
import { navByRole, roleLabel } from './navConfig';
import { PLATFORM_NAME } from '@/lib/brand';
import { cn } from '@/common/utils/cn';
import { PlatformLogo } from './PlatformLogo';
import { ComingSoonBadge } from '@/components/ui/ComingSoon';

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-ink-900/8 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-ink-900/8 px-5">
        <PlatformLogo size="sm" className="h-8 w-8 rounded-lg" />
        <div>
          <p className="font-display text-[13px] font-semibold leading-tight text-ink-900">
            {PLATFORM_NAME}
          </p>
          <p className="text-xs leading-tight text-ink-500">{roleLabel[role]}</p>
        </div>
      </div>
      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                aria-disabled="true"
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-300"
              >
                <Icon className="h-4.5 w-4.5 text-ink-200" />
                <span>{item.label}</span>
                <ComingSoonBadge className="ml-auto" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-surface-subtle hover:text-ink-900'
              )}
            >
              <Icon className={cn('h-4.5 w-4.5', active ? 'text-brand-600' : 'text-ink-300')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
