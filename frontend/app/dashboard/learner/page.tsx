'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, TrendingUp, PlayCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { enrollmentsService } from '@/lib/services/enrollments.service';
import { progressService } from '@/lib/services/progress.service';
import { certificatesService } from '@/lib/services/certificates.service';
import type { Enrollment, ProgressSummary, Certificate } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { PLATFORM_TAGLINE } from '@/lib/brand';

export default function LearnerOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<ProgressSummary[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      enrollmentsService.listMine().catch(() => []),
      progressService.myProgress().catch(() => []),
      certificatesService.myCertificates().catch(() => []),
    ])
      .then(([e, p, c]) => {
        setEnrollments(e);
        setProgress(p);
        setCertificates(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const overallProgress = loading
    ? 0
    : progress.reduce((sum, p) => sum + (p.overallPercent || 0), 0) /
      (progress.length || 1);
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const progressByCourse = new Map(progress.map((p) => [p.courseId, p]));

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white sm:p-8">
        <p className="font-display text-sm font-medium uppercase tracking-wide text-brand-200">
          {PLATFORM_TAGLINE}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          {firstName}, your skills are building every day.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-brand-100">
          Track your real progress, keep your streak alive, and earn certificates as you
          complete courses. Consistency beats intensity.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-xs text-brand-200">Overall progress</p>
            <p className="font-display text-xl font-semibold">{Math.round(overallProgress)}%</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-xs text-brand-200">Courses in progress</p>
            <p className="font-display text-xl font-semibold">
              {loading ? '…' : enrollments.filter((e) => e.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-xs text-brand-200">Certificates</p>
            <p className="font-display text-xl font-semibold">{loading ? '…' : certificates.length}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
            <BookOpen className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Enrolled courses</p>
            <p className="font-display text-xl font-semibold text-ink-900">{loading ? '…' : enrollments.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50">
            <TrendingUp className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Courses completed</p>
            <p className="font-display text-xl font-semibold text-ink-900">
              {loading ? '…' : enrollments.filter((e) => e.status === 'COMPLETED').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
            <Award className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-500">Certificates earned</p>
            <p className="font-display text-xl font-semibold text-ink-900">{loading ? '…' : certificates.length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Continue learning</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={`Welcome, ${user?.fullName?.split(' ')[0] ?? 'there'}!`}
            description="You haven't enrolled in any courses yet. Browse departments to get started."
            action={
              <Link href="/dashboard/learner/courses" className="text-sm font-medium text-brand-600 hover:underline">
                Browse courses
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center gap-4 rounded-xl border border-ink-900/8 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <PlayCircle className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{e.courseTitle}</p>
                  <ProgressBar value={progressByCourse.get(e.courseId)?.overallPercent ?? 0} className="mt-1.5" />
                </div>
                <span className="shrink-0 text-sm text-ink-500">
                  {Math.round(progressByCourse.get(e.courseId)?.overallPercent ?? 0)}%
                </span>
                <Link
                  href={
                    progressByCourse.get(e.courseId)?.nextLessonId
                      ? `/courses/${e.courseId}/lessons/${progressByCourse.get(e.courseId)?.nextLessonId}`
                      : `/courses/${e.courseId}`
                  }
                  className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                >
                  Resume
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
