'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, Award } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { analyticsService, type PlatformAnalytics } from '@/lib/services/analytics.service';
import { DEPARTMENT_LABELS } from '@/types';

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

export default function AdminOverviewPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .platform()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const departmentData =
    data?.enrollmentsByDepartment.map((d) => ({
      name: DEPARTMENT_LABELS[d.department as keyof typeof DEPARTMENT_LABELS] ?? d.department,
      count: d.count,
    })) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <StatCard icon={Users} label="Total users" value={data?.totalUsers ?? 0} />
            <StatCard icon={BookOpen} label="Active courses" value={data?.totalCourses ?? 0} />
            <StatCard icon={ClipboardList} label="Enrollments" value={data?.totalEnrollments ?? 0} />
            <StatCard icon={Award} label="Completion rate" value={`${Math.round(data?.completionRate ?? 0)}%`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enrollments over time</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data?.enrollmentsOverTime ?? []}>
                <defs>
                  <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9497ad" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9497ad" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#4338ca" fill="url(#enrollGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By department</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departmentData} layout="vertical" margin={{ left: 12 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="#9497ad" />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
