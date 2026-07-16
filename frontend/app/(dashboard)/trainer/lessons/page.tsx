'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Video, Plus, Trash2, Link2, Layers } from 'lucide-react';
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
import { lessonSchema, moduleSchema, type LessonFormValues, type ModuleFormValues } from '@/components/forms/schemas';
import { lessonsService } from '@/lib/services/lessons.service';
import { coursesService } from '@/lib/services/courses.service';
import type { Course, CourseModule, Lesson } from '@/types';
import { formatDuration } from '@/common/utils/format';

function LessonsContent() {
  const params = useSearchParams();
  const initialCourseId = params.get('courseId') ?? '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');

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
      .listModulesByCourse(id)
      .then((data) => {
        setModules(data);
        if (data.length && !selectedModuleId) setSelectedModuleId(data[0].id);
      })
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function removeLesson(lessonId: string) {
    await lessonsService.remove(courseId, lessonId);
    setModules((prev) =>
      prev.map((module) => ({
        ...module,
        lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
      })),
    );
  }

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);

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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setCreateModuleOpen(true)} disabled={!courseId}>
            <Layers className="h-4 w-4" /> Add module
          </Button>
          <Button onClick={() => setCreateLessonOpen(true)} disabled={!courseId || modules.length === 0}>
            <Plus className="h-4 w-4" /> Add lesson
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No modules yet"
          description="Create a module first, then add lessons, quizzes, and assignments within it."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {modules.map((module) => (
            <Card key={module.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-600" />
                <p className="font-display text-sm font-semibold text-ink-900">
                  Module {module.order}. {module.title}
                </p>
              </div>

              {module.lessons.length === 0 ? (
                <p className="text-sm text-ink-500">No lessons in this module yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 rounded-xl border border-ink-900/8 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                        <Video className="h-4 w-4 text-brand-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink-900">
                          {lesson.order}. {lesson.title}
                        </p>
                        <p className="truncate text-xs text-ink-500">{lesson.content}</p>
                      </div>
                      {lesson.videoUrl && (
                        <div className="flex items-center gap-1 text-xs text-ink-500">
                          <Link2 className="h-3.5 w-3.5" /> {formatDuration(lesson.durationSeconds)}
                        </div>
                      )}
                      <button
                        onClick={() => removeLesson(lesson.id)}
                        className="rounded-lg p-2 text-ink-300 hover:bg-red-50 hover:text-danger"
                        aria-label="Delete lesson"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
          <p className="text-xs text-ink-500">{modules.length} modules · {totalLessons} lessons total</p>
        </div>
      )}

      <CreateModuleModal
        open={createModuleOpen}
        onClose={() => setCreateModuleOpen(false)}
        courseId={courseId}
        nextOrder={modules.length + 1}
        onCreated={(module) => {
          setModules((prev) => [...prev, { ...module, lessons: [] }].sort((a, b) => a.order - b.order));
          setSelectedModuleId(module.id);
          setCreateModuleOpen(false);
        }}
      />

      <CreateLessonModal
        open={createLessonOpen}
        onClose={() => setCreateLessonOpen(false)}
        courseId={courseId}
        modules={modules}
        defaultModuleId={selectedModuleId || modules[0]?.id}
        onCreated={(lesson, moduleId) => {
          setModules((prev) =>
            prev.map((module) =>
              module.id === moduleId
                ? { ...module, lessons: [...module.lessons, lesson].sort((a, b) => a.order - b.order) }
                : module,
            ),
          );
          setCreateLessonOpen(false);
        }}
      />
    </div>
  );
}

function CreateModuleModal({
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
  onCreated: (module: CourseModule) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { order: nextOrder },
  });

  async function onSubmit(values: ModuleFormValues) {
    const module = await lessonsService.createModule({
      title: values.title,
      courseId,
      order: values.order,
    });
    reset({ order: nextOrder + 1 });
    onCreated({ ...module, lessons: [] });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add module">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Module title" error={errors.title?.message} {...register('title')} />
        <Input label="Order" type="number" min={1} error={errors.order?.message} {...register('order')} />
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Save module
        </Button>
      </form>
    </Modal>
  );
}

function CreateLessonModal({
  open,
  onClose,
  courseId,
  modules,
  defaultModuleId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  modules: CourseModule[];
  defaultModuleId?: string;
  onCreated: (lesson: Lesson, moduleId: string) => void;
}) {
  const selectedModule = modules.find((module) => module.id === defaultModuleId) ?? modules[0];
  const nextOrder = (selectedModule?.lessons.length ?? 0) + 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { order: nextOrder, moduleId: defaultModuleId },
  });

  async function onSubmit(values: LessonFormValues) {
    const targetModuleId = values.moduleId || defaultModuleId;
    if (!targetModuleId) return;

    const lesson = await lessonsService.create(courseId, {
      ...values,
      moduleId: targetModuleId,
      videoUrl: values.videoUrl || undefined,
    });
    reset({ order: nextOrder + 1, moduleId: targetModuleId });
    onCreated(lesson, targetModuleId);
  }

  return (
    <Modal open={open} onClose={onClose} title="Add lesson">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Module" error={errors.moduleId?.message} {...register('moduleId')}>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </Select>
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
