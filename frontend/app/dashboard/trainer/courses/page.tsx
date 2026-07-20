'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '@/components/forms/schemas';
import { coursesService } from '@/lib/services/courses.service';
import { DEPARTMENT_LABELS, DEPARTMENTS, type Course } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  function load() {
    setLoading(true);
    coursesService
      .list({ pageSize: 50 })
      .then((r) => setCourses(r.data.filter((c) => c.trainerId === user?.id)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, [user?.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Build lessons, quizzes, and assignments for each course you own.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New course
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to start building lessons." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge tone="brand">{DEPARTMENT_LABELS[c.department]}</Badge>
                <Badge tone={c.isPublished ? 'success' : 'default'}>{c.isPublished ? 'Published' : 'Draft'}</Badge>
              </div>
              <p className="font-display text-base font-semibold text-ink-900">{c.title}</p>
              <p className="line-clamp-2 text-sm text-ink-500">{c.description}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-ink-500">
                <span>{c.enrolledCount} learners</span>
                <span>{c.lessonCount} lessons</span>
              </div>
              <Link
                href={`/dashboard/trainer/lessons?courseId=${c.id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <PlayCircle className="h-4 w-4" /> Manage lessons
              </Link>
            </Card>
          ))}
        </div>
      )}

      <CreateCourseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />
    </div>
  );
}

function CreateCourseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({ resolver: zodResolver(courseSchema) });

  async function onSubmit(values: CourseFormValues) {
    await coursesService.create(values);
    reset();
    onCreated();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create course">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <Select label="Department" error={errors.department?.message} {...register('department')}>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </option>
          ))}
        </Select>
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Create course
        </Button>
      </form>
    </Modal>
  );
}
