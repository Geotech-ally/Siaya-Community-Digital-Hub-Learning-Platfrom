'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { coursesService } from '@/lib/services/courses.service';
import { DEPARTMENT_LABELS, DEPARTMENTS, type Department } from '@/types';

const swatches: Record<Department, string> = {
  BASIC_ICT_SKILLS: 'from-sky-500 to-sky-300',
  DESIGN_COURSES: 'from-fuchsia-500 to-fuchsia-300',
  MARKETING_COURSES: 'from-amber-500 to-amber-300',
  COMPUTER_SCIENCE: 'from-brand-600 to-brand-400',
  DATA_SCIENCE_AND_AI: 'from-emerald-500 to-emerald-300',
};

export default function AdminDepartmentsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      DEPARTMENTS.map((d) =>
        coursesService.list({ department: d, pageSize: 1 }).then((r) => [d, r.total] as const)
      )
    )
      .then((results) => setCounts(Object.fromEntries(results)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-500">
        Every course belongs to exactly one department. These five categories are fixed platform-wide.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => (
          <Card key={d} className="overflow-hidden p-0">
            <div className={`h-2 w-full bg-gradient-to-r ${swatches[d]}`} />
            <div className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
                <Layers className="h-5 w-5 text-ink-700" />
              </div>
              <p className="font-display text-base font-semibold text-ink-900">{DEPARTMENT_LABELS[d]}</p>
              {loading ? (
                <Skeleton className="mt-2 h-4 w-24" />
              ) : (
                <p className="mt-1 text-sm text-ink-500">{counts[d] ?? 0} courses</p>
              )}
              <Link
                href={`/dashboard/admin/courses?department=${d}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
              >
                View courses <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
