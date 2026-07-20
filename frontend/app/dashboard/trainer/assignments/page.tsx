'use client';

import { useEffect, useState } from 'react';
import { FileEdit, Plus, Trash2 } from 'lucide-react';
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
import { assignmentSchema, type AssignmentFormValues } from '@/components/forms/schemas';
import { assignmentsService } from '@/lib/services/assignments.service';
import { coursesService } from '@/lib/services/courses.service';
import type { Assignment, Course } from '@/types';
import { formatDate } from '@/common/utils/format';

export default function TrainerAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    coursesService.list({ pageSize: 50 }).then((r) => {
      setCourses(r.data);
      if (r.data.length) setCourseId(r.data[0].id);
    });
  }, []);

  function load(id: string) {
    if (!id) return;
    setLoading(true);
    assignmentsService
      .listByCourse(id)
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function remove(id: string) {
    await assignmentsService.remove(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
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
          <Plus className="h-4 w-4" /> New assignment
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={FileEdit} title="No assignments yet" description="Create an assignment for learners to submit." />
      ) : (
        <div className="flex flex-col gap-3">
          {assignments.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-ink-900">{a.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-ink-500">{a.instructions}</p>
                <p className="mt-1 text-xs text-ink-500">
                  Due {formatDate(a.dueDate)} · {a.maxScore} pts
                </p>
              </div>
              <button
                onClick={() => remove(a.id)}
                className="rounded-lg p-2 text-ink-300 hover:bg-red-50 hover:text-danger"
                aria-label="Delete assignment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <CreateAssignmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        courseId={courseId}
        onCreated={(a) => {
          setAssignments((prev) => [...prev, a]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateAssignmentModal({
  open,
  onClose,
  courseId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onCreated: (a: Assignment) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({ resolver: zodResolver(assignmentSchema) });

  async function onSubmit(values: AssignmentFormValues) {
    const created = await assignmentsService.create(courseId, values);
    reset();
    onCreated(created);
  }

  return (
    <Modal open={open} onClose={onClose} title="New assignment">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Instructions" error={errors.instructions?.message} {...register('instructions')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <Input label="Max score" type="number" min={1} error={errors.maxScore?.message} {...register('maxScore')} />
        </div>
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Create assignment
        </Button>
      </form>
    </Modal>
  );
}
