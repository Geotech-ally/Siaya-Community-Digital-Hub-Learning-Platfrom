'use client';

import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { progressService } from '@/lib/services/progress.service';
import type { ProgressSummary } from '@/types';

export default function LearnerProgressPage() {
  const [items, setItems] = useState<ProgressSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService
      .myProgress()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={GraduationCap} title="No progress yet" description="Enroll in a course to start tracking your progress." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {items.map((p) => (
        <Card key={p.courseId}>
          <p className="font-display text-base font-semibold text-ink-900">{p.courseTitle}</p>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={p.overallPercent} className="flex-1" />
            <span className="text-sm font-medium text-ink-700">{Math.round(p.overallPercent)}%</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">
                {p.lessonsCompleted}/{p.totalLessons}
              </p>
              <p className="text-xs text-ink-500">Lessons</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">
                {p.quizzesPassed}/{p.totalQuizzes}
              </p>
              <p className="text-xs text-ink-500">Quizzes</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink-900">
                {p.assignmentsSubmitted}/{p.totalAssignments}
              </p>
              <p className="text-xs text-ink-500">Assignments</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
