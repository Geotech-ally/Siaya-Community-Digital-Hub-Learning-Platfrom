'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { announcementSchema, type AnnouncementFormValues } from '@/components/forms/schemas';
import { notificationsService } from '@/lib/services/notifications.service';
import type { Announcement } from '@/types';
import { formatRelative } from '@/common/utils/format';

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  function load() {
    setLoading(true);
    notificationsService
      .listAnnouncements({ pageSize: 50 })
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function remove(id: string) {
    await notificationsService.removeAnnouncement(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Platform-wide announcements reach every learner and trainer.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New announcement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Post an update for your learners and trainers." />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((a) => (
            <Card key={a.id} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-ink-900">{a.title}</p>
                <p className="mt-1 text-sm text-ink-700">{a.body}</p>
                <p className="mt-2 text-xs text-ink-500">{formatRelative(a.createdAt)}</p>
              </div>
              <button
                onClick={() => remove(a.id)}
                className="rounded-lg p-2 text-ink-300 hover:bg-red-50 hover:text-danger"
                aria-label="Delete announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <CreateAnnouncementModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(a) => {
          setItems((prev) => [a, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateAnnouncementModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (a: Announcement) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({ resolver: zodResolver(announcementSchema) });

  async function onSubmit(values: AnnouncementFormValues) {
    const created = await notificationsService.createAnnouncement(values);
    reset();
    onCreated(created);
  }

  return (
    <Modal open={open} onClose={onClose} title="New announcement">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Message" error={errors.body?.message} {...register('body')} />
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Publish announcement
        </Button>
      </form>
    </Modal>
  );
}
