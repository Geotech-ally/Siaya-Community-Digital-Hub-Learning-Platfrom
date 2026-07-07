'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, PlayCircle, HelpCircle, FileEdit, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { coursesService } from '@/lib/services/courses.service';
import { lessonsService } from '@/lib/services/lessons.service';
import { quizzesService } from '@/lib/services/quizzes.service';
import { assignmentsService } from '@/lib/services/assignments.service';
import { enrollmentsService } from '@/lib/services/enrollments.service';
import { useAuthStore } from '@/store/auth.store';
import { DEPARTMENT_LABELS } from '@/types';
import type { Assignment, Course, Lesson, Quiz } from '@/types';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesService.get(courseId),
      lessonsService.listByCourse(courseId).catch(() => []),
      quizzesService.listByCourse(courseId).catch(() => []),
      assignmentsService.listByCourse(courseId).catch(() => []),
      enrollmentsService.listMine().catch(() => []),
    ])
      .then(([c, l, q, a, mine]) => {
        setCourse(c);
        setLessons(l.sort((x, y) => x.order - y.order));
        setQuizzes(q);
        setAssignments(a);
        setEnrolled(mine.some((e) => e.courseId === courseId));
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  async function enroll() {
    setEnrolling(true);
    try {
      await enrollmentsService.enroll(courseId);
      setEnrolled(true);
    } finally {
      setEnrolling(false);
    }
  }

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
        Course not found. <button onClick={() => router.back()} className="text-brand-600 hover:underline">Go back</button>
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
              <BookOpen className="h-4 w-4" /> {lessons.length} lessons
            </span>
          </div>
          {user?.role === 'LEARNER' && (
            <div className="mt-5">
              {enrolled ? (
                <Badge tone="success" className="px-3 py-1.5 text-sm">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Enrolled
                </Badge>
              ) : (
                <Button onClick={enroll} isLoading={enrolling}>
                  Enroll in this course
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-6 py-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-3 font-display text-sm font-semibold text-ink-900">Lessons</p>
          <div className="flex flex-col gap-2">
            {lessons.map((l) => (
              <Link
                key={l.id}
                href={enrolled || user?.role !== 'LEARNER' ? `/courses/${courseId}/lessons/${l.id}` : '#'}
                className={`flex items-center gap-3 rounded-xl border border-ink-900/8 p-3 ${
                  enrolled || user?.role !== 'LEARNER' ? 'hover:bg-surface-subtle' : 'cursor-not-allowed opacity-60'
                }`}
              >
                <PlayCircle className="h-4 w-4 text-brand-600" />
                <span className="text-sm text-ink-700">
                  {l.order}. {l.title}
                </span>
              </Link>
            ))}
            {lessons.length === 0 && <p className="text-sm text-ink-500">No lessons published yet.</p>}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-3 font-display text-sm font-semibold text-ink-900">Quizzes</p>
            <div className="flex flex-col gap-2">
              {quizzes.map((q) => (
                <Link key={q.id} href={`/quizzes/${q.id}`} className="flex items-center gap-2 text-sm text-ink-700 hover:text-brand-600">
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
                <Link key={a.id} href={`/assignments/${a.id}`} className="flex items-center gap-2 text-sm text-ink-700 hover:text-brand-600">
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
