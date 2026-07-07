'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Video, Plus, GripVertical, Trash2, FileText, Link2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lessonSchema, type LessonFormValues } from '@/components/forms/schemas';
import { lessonsService } from '@/lib/services/lessons.service';
import { coursesService } from '@/lib/services/courses.service';
import type { Course, Lesson } from '@/types';
import { formatDuration } from '@/common/utils/format';

function LessonsContent() {
  const params = useSearchParams();
  const initialCourseId = params.get('courseId') ?? '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    coursesService.list({ pageSize: 50 }).then((r) => {
      setCourses(r.data);
      if (!courseId && r.data.length) setCourseId(r.data[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function load(id: string) {
    if (!id) return;
    setLoading(true);
    lessonsService
      .listByCourse(id)
      .then((data) => setLessons(data.sort((a, b) => a.order - b.order)))
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function remove(lessonId: string) {
    await lessonsService.remove(courseId, lessonId);
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-64">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Button onClick={() => setCreateOpen(true)} disabled={!courseId}>
          <Plus className="h-4 w-4" /> Add lesson
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState icon={Video} title="No lessons yet" description="Add your first video or text lesson." />
      ) : (
        <div className="flex flex-col gap-2">
          {lessons.map((l) => (
            <Card key={l.id} className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 shrink-0 text-ink-300" />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Video className="h-4 w-4 text-brand-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">
                  {l.order}. {l.title}
                </p>
                <p className="truncate text-xs text-ink-500">{l.content}</p>
              </div>
              {l.videoUrl && (
                <div className="flex items-center gap-1 text-xs text-ink-500">
                  <Link2 className="h-3.5 w-3.5" /> {formatDuration(l.durationSeconds)}
                </div>
              )}
              <button
                onClick={() => remove(l.id)}
                className="rounded-lg p-2 text-ink-300 hover:bg-red-50 hover:text-danger"
                aria-label="Delete lesson"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <CreateLessonModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        courseId={courseId}
        nextOrder={lessons.length + 1}
        onCreated={(lesson) => {
          setLessons((prev) => [...prev, lesson].sort((a, b) => a.order - b.order));
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateLessonModal({
  open,
  onClose,
  courseId,
  nextOrder,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  nextOrder: number;
  onCreated: (lesson: Lesson) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { order: nextOrder },
  });

  async function onSubmit(values: LessonFormValues) {
    const lesson = await lessonsService.create(courseId, {
      ...values,
      videoUrl: values.videoUrl || undefined,
    });
    reset();
    onCreated(lesson);
  }

  return (
    <Modal open={open} onClose={onClose} title="Add lesson">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Lesson title" error={errors.title?.message} {...register('title')} />
        <Textarea
          label="Lesson content"
          error={errors.content?.message}
          placeholder="Write the lesson text, key points, or a transcript…"
          {...register('content')}
        />
        <Input
          label="Video URL (Mux / S3)"
          placeholder="https://stream.mux.com/…"
          error={errors.videoUrl?.message}
          {...register('videoUrl')}
        />
        <Input label="Order" type="number" min={1} error={errors.order?.message} {...register('order')} />
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Save lesson
        </Button>
      </form>
    </Modal>
  );
}

export default function TrainerLessonsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <LessonsContent />
    </Suspense>
  );
}
