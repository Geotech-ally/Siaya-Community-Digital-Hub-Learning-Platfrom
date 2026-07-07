'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Percent, Gauge } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { analyticsService, type TrainerAnalytics } from '@/lib/services/analytics.service';

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="font-display text-xl font-semibold text-ink-900">{value}</p>
      </div>
    </Card>
  );
}

export default function TrainerOverviewPage() {
  const [data, setData] = useState<TrainerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .trainer()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <StatCard icon={BookOpen} label="My courses" value={data?.totalCourses ?? 0} />
            <StatCard icon={Users} label="Total learners" value={data?.totalLearners ?? 0} />
            <StatCard icon={Percent} label="Avg. completion" value={`${Math.round(data?.averageCompletionRate ?? 0)}%`} />
            <StatCard icon={Gauge} label="Avg. quiz score" value={`${Math.round(data?.averageQuizScore ?? 0)}%`} />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learners per course</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.courseBreakdown ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" />
              <XAxis dataKey="courseTitle" tick={{ fontSize: 11 }} stroke="#9497ad" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9497ad" />
              <Tooltip />
              <Bar dataKey="learners" fill="#4338ca" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completion by course</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6" />)
            : (data?.courseBreakdown ?? []).map((c) => (
                <div key={c.courseId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-700">{c.courseTitle}</span>
                    <span className="text-ink-500">{Math.round(c.completionRate)}%</span>
                  </div>
                  <ProgressBar value={c.completionRate} />
                </div>
              ))}
        </div>
      </Card>
    </div>
  );
}
