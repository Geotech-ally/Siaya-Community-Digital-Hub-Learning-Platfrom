'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  PlayCircle,
  HelpCircle,
  FileEdit,
  CheckCircle2,
  Layers,
  LogIn,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { coursesService } from '@/lib/services/courses.service';
import { lessonsService } from '@/lib/services/lessons.service';
import { quizzesService } from '@/lib/services/quizzes.service';
import { assignmentsService } from '@/lib/services/assignments.service';
import { enrollmentsService } from '@/lib/services/enrollments.service';
import { progressService } from '@/lib/services/progress.service';
import { useAuthStore } from '@/store/auth.store';
import { DEPARTMENT_LABELS } from '@/types';
import type { Assignment, Course, CourseModule, Quiz } from '@/types';
import { cn } from '@/common/utils/cn';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const isAuthenticated = Boolean(user);
    Promise.all([
      coursesService.get(courseId),
      lessonsService.listModulesByCourse(courseId).catch(() => []),
      isAuthenticated ? quizzesService.listByCourse(courseId).catch(() => []) : Promise.resolve([]),
      isAuthenticated ? assignmentsService.listByCourse(courseId).catch(() => []) : Promise.resolve([]),
      user?.role === 'LEARNER' ? enrollmentsService.listMine().catch(() => []) : Promise.resolve([]),
      user?.role === 'LEARNER' ? progressService.courseProgress(courseId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([c, m, q, a, mine, progress]) => {
        setCourse(c);
        setModules(m);
        setQuizzes(q);
        setAssignments(a);
        const isEnrolled = mine.some((e) => e.courseId === courseId);
        setEnrolled(isEnrolled);
        if (progress) {
          setCompletedLessonIds(new Set(progress.completedLessonIds ?? []));
          setNextLessonId(progress.nextLessonId ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId, user]);

  async function enroll() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentsService.enroll(courseId);
      setEnrolled(true);
      const progress = await progressService.courseProgress(courseId).catch(() => null);
      if (progress) {
        setCompletedLessonIds(new Set(progress.completedLessonIds ?? []));
        setNextLessonId(progress.nextLessonId ?? null);
      }
    } finally {
      setEnrolling(false);
    }
  }

  function canAccessLessons() {
    return enrolled || user?.role === 'ADMIN' || user?.role === 'TRAINER';
  }

  function lessonHref(lessonId: string) {
    return canAccessLessons() ? `/courses/${courseId}/lessons/${lessonId}` : '#';
  }

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const resumeLessonId = nextLessonId ?? modules.flatMap((m) => m.lessons)[0]?.id ?? null;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center text-ink-500">
        Course not found.{' '}
        <button onClick={() => router.back()} className="text-brand-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="border-b border-ink-900/8 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Badge tone="brand">{DEPARTMENT_LABELS[course.department]}</Badge>
          <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900">{course.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-500">{course.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-ink-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {course.enrolledCount} learners
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" /> {modules.length} modules
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> {totalLessons} lessons
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!user && (
              <>
                <Link href={`/register?redirect=${encodeURIComponent(`/courses/${courseId}`)}`}>
                  <Button>Create account to enroll</Button>
                </Link>
                <Link href={`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`}>
                  <Button variant="outline">
                    <LogIn className="h-4 w-4" /> Sign in
                  </Button>
                </Link>
              </>
            )}

            {user?.role === 'LEARNER' && (
              <>
                {enrolled ? (
                  <>
                    <Badge tone="success" className="px-3 py-1.5 text-sm">
                      <CheckCircle2 className="mr-1 h-4 w-4" /> Enrolled
                    </Badge>
                    {resumeLessonId && (
                      <Link href={`/courses/${courseId}/lessons/${resumeLessonId}`}>
                        <Button>
                          <PlayCircle className="h-4 w-4" /> Continue learning
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <Button onClick={enroll} isLoading={enrolling}>
                    Enroll in this course
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 py-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {modules.map((module) => (
            <Card key={module.id}>
              <p className="mb-3 font-display text-sm font-semibold text-ink-900">
                Module {module.order}. {module.title}
              </p>
              <div className="flex flex-col gap-2">
                {module.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.has(lesson.id);
                  const accessible = canAccessLessons();

                  return (
                    <Link
                      key={lesson.id}
                      href={lessonHref(lesson.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border border-ink-900/8 p-3',
                        accessible ? 'hover:bg-surface-subtle' : 'cursor-not-allowed opacity-60',
                        isCompleted && accessible && 'border-success/20 bg-green-50/40',
                      )}
                    >
                      {isCompleted && accessible ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-brand-600" />
                      )}
                      <span className="text-sm text-ink-700">
                        {lesson.order}. {lesson.title}
                      </span>
                    </Link>
                  );
                })}
                {module.lessons.length === 0 && (
                  <p className="text-sm text-ink-500">No lessons in this module yet.</p>
                )}
              </div>
            </Card>
          ))}
          {modules.length === 0 && (
            <Card>
              <p className="text-sm text-ink-500">Course content is being prepared. Check back soon.</p>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-3 font-display text-sm font-semibold text-ink-900">Quizzes</p>
            <div className="flex flex-col gap-2">
              {quizzes.map((q) => (
                <Link
                  key={q.id}
                  href={canAccessLessons() ? `/quizzes/${q.id}` : '#'}
                  className={cn(
                    'flex items-center gap-2 text-sm text-ink-700',
                    canAccessLessons() ? 'hover:text-brand-600' : 'pointer-events-none opacity-60',
                  )}
                >
                  <HelpCircle className="h-4 w-4 text-ink-300" /> {q.title}
                </Link>
              ))}
              {quizzes.length === 0 && <p className="text-sm text-ink-500">None yet.</p>}
            </div>
          </Card>
          <Card>
            <p className="mb-3 font-display text-sm font-semibold text-ink-900">Assignments</p>
            <div className="flex flex-col gap-2">
              {assignments.map((a) => (
                <Link
                  key={a.id}
                  href={canAccessLessons() ? `/assignments/${a.id}` : '#'}
                  className={cn(
                    'flex items-center gap-2 text-sm text-ink-700',
                    canAccessLessons() ? 'hover:text-brand-600' : 'pointer-events-none opacity-60',
                  )}
                >
                  <FileEdit className="h-4 w-4 text-ink-300" /> {a.title}
                </Link>
              ))}
              {assignments.length === 0 && <p className="text-sm text-ink-500">None yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
