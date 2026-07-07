'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationsStore } from '@/store/notifications.store';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetch } = useNotificationsStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const notificationsHref = user ? `/dashboard/${user.role.toLowerCase()}/notifications` : '/notifications';

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink-900/8 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-surface-subtle lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5 text-ink-700" />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={notificationsHref}
          className="relative rounded-full p-2 hover:bg-surface-subtle"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-ink-700" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-surface-subtle"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {user?.fullName?.charAt(0) ?? '?'}
            </div>
            <span className="hidden text-sm font-medium text-ink-700 sm:inline">{user?.fullName}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-48 rounded-xl border border-ink-900/8 bg-white p-1.5 shadow-popover">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-surface-subtle"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
