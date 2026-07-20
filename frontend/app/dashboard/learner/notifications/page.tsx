'use client';

import { useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useNotificationsStore } from '@/store/notifications.store';
import { formatRelative } from '@/common/utils/format';
import { cn } from '@/common/utils/cn';

export default function LearnerNotificationsPage() {
  const { items, isLoading, fetch, markRead, markAllRead, unreadCount } = useNotificationsStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{unreadCount} unread</p>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="Announcements and updates will show up here." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={cn('flex cursor-pointer items-start gap-3', !n.read && 'border-brand-200 bg-brand-50/40')}
            >
              <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand-500')} />
              <div className="flex-1">
                <p className="font-medium text-ink-900">{n.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
                <p className="mt-1 text-xs text-ink-300">{formatRelative(n.createdAt)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
