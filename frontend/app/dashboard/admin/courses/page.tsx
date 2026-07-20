'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Tr, Th, Td } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '@/components/forms/schemas';
import { coursesService } from '@/lib/services/courses.service';
import { usersService } from '@/lib/services/users.service';
import { DEPARTMENT_LABELS, DEPARTMENTS, type Course, type Department, type User } from '@/types';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [department, setDepartment] = useState<Department | ''>('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [trainers, setTrainers] = useState<User[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await coursesService.list({ department: department || undefined, pageSize: 50 });
      setCourses(res.data);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  useEffect(() => {
    usersService.list({ role: 'TRAINER', pageSize: 100 }).then((r) => setTrainers(r.data)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={department} onChange={(e) => setDepartment(e.target.value as Department | '')} className="w-56">
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </option>
          ))}
        </Select>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New course
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={BookOpen} title="No courses yet" description="Create the first course for this department." />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Department</Th>
                <Th>Trainer</Th>
                <Th>Enrolled</Th>
                <Th>Lessons</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <tbody>
              {courses.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-ink-900">{c.title}</Td>
                  <Td>{DEPARTMENT_LABELS[c.department]}</Td>
                  <Td>{c.trainerName ?? 'Unassigned'}</Td>
                  <Td>{c.enrolledCount}</Td>
                  <Td>{c.lessonCount}</Td>
                  <Td>
                    <Badge tone={c.isPublished ? 'success' : 'default'}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  <Td>
                    <AssignTrainerControl course={c} trainers={trainers} onAssigned={load} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <CreateCourseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        trainers={trainers}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />
    </div>
  );
}

function AssignTrainerControl({
  course,
  trainers,
  onAssigned,
}: {
  course: Course;
  trainers: User[];
  onAssigned: () => void;
}) {
  const [value, setValue] = useState(course.trainerId ?? '');
  const [saving, setSaving] = useState(false);

  async function onChange(id: string) {
    setValue(id);
    setSaving(true);
    try {
      await coursesService.assignTrainer(course.id, id);
      onAssigned();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={saving} className="h-9 w-40 text-xs">
      <option value="">Assign trainer…</option>
      {trainers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.fullName}
        </option>
      ))}
    </Select>
  );
}

function CreateCourseModal({
  open,
  onClose,
  onCreated,
  trainers,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  trainers: User[];
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-700">Description</label>
          <textarea
            className="min-h-[100px] rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-sm"
            {...register('description')}
          />
          {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
        </div>
        <Select label="Department" error={errors.department?.message} {...register('department')}>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {DEPARTMENT_LABELS[d]}
            </option>
          ))}
        </Select>
        <Select label="Trainer (optional)" {...register('trainerId')}>
          <option value="">Unassigned</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
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
