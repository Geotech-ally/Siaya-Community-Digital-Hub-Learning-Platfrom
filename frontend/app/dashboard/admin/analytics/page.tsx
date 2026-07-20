'use client';

import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { analyticsService, type PlatformAnalytics } from '@/lib/services/analytics.service';
import { DEPARTMENT_LABELS } from '@/types';

const COLORS = ['#4338ca', '#818cf8', '#f59e0b', '#16a34a', '#dc2626'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .platform()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const pieData =
    data?.enrollmentsByDepartment.map((d) => ({
      name: DEPARTMENT_LABELS[d.department as keyof typeof DEPARTMENT_LABELS] ?? d.department,
      value: d.count,
    })) ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Enrollment mix by department</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-72" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment trend</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-72" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.enrollmentsOverTime ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9497ad" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9497ad" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4338ca" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Platform completion rate</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-10 w-32" />
        ) : (
          <p className="font-display text-4xl font-semibold text-ink-900">
            {Math.round(data?.completionRate ?? 0)}%
            <span className="ml-2 text-sm font-normal text-ink-500">of enrolled learners complete their course</span>
          </p>
        )}
      </Card>
    </div>
  );
}
