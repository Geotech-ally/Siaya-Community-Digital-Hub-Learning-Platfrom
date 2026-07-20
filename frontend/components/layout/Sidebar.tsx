'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/types';
import { navByRole, roleLabel } from './navConfig';
import { PLATFORM_NAME } from '@/lib/brand';
import { cn } from '@/common/utils/cn';
import { PlatformLogo } from './PlatformLogo';
import { ComingSoonBadge } from '@/components/ui/ComingSoon';

/**
 * Shared sidebar content (logo header + role nav). Rendered inside both the
 * desktop `Sidebar` aside and the `MobileSidebar` drawer, so the two never
 * drift. `onNavigate` lets the mobile drawer close itself on link tap.
 */
export function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = navByRole[role];
  const rootHref = items[0]?.href;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-ink-900/8 px-5">
        <PlatformLogo size="sm" className="h-9 w-9" />
        <div className="min-w-0">
          <p className="truncate font-display text-[13px] font-semibold leading-tight text-ink-900">
            {PLATFORM_NAME}
          </p>
          <p className="text-xs leading-tight text-ink-500">{roleLabel[role]}</p>
        </div>
      </div>

      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          // Exact match for the section root (Overview); prefix match elsewhere,
          // so Overview no longer stays highlighted on every sub-page.
          const active =
            pathname === item.href ||
            (item.href !== rootHref && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                aria-disabled="true"
                title="Coming soon"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-300"
              >
                <Icon className="h-[18px] w-[18px] text-ink-200" />
                <span>{item.label}</span>
                <ComingSoonBadge className="ml-auto" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-500 hover:bg-surface-subtle hover:text-ink-900'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active ? 'text-brand-600' : 'text-ink-300')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink-900/8 lg:block">
      <SidebarContent role={role} />
    </aside>
  );
}
