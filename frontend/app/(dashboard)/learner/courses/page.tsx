'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { coursesService } from '@/lib/services/courses.service';
import { useDebounce } from '@/common/hooks/useDebounce';
import { DEPARTMENT_LABELS, DEPARTMENTS, type Course, type Department } from '@/types';
import { cn } from '@/common/utils/cn';

export default function LearnerCoursesPage() {
  const [department, setDepartment] = useState<Department | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const debounced = useDebounce(search, 350);

  useEffect(() => {
    setLoading(true);
    coursesService
      .list({
        department: department === 'ALL' ? undefined : department,
        search: debounced || undefined,
        pageSize: 50,
      })
      .then((r) => setCourses(r.data.filter((c) => c.isPublished)))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [department, debounced]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <Input placeholder="Search courses" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDepartment('ALL')}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
            department === 'ALL' ? 'bg-brand-600 text-white' : 'bg-white text-ink-700 hover:bg-surface-muted'
          )}
        >
          All departments
        </button>
        {DEPARTMENTS.map((d) => (
          <button
            key={d}
            onClick={() => setDepartment(d)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              department === d ? 'bg-brand-600 text-white' : 'bg-white text-ink-700 hover:bg-surface-muted'
            )}
          >
            {DEPARTMENT_LABELS[d]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses found" description="Try a different department or search term." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.id} href={`/courses/${c.id}`}>
              <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-popover">
                <Badge tone="brand" className="w-fit">
                  {DEPARTMENT_LABELS[c.department]}
                </Badge>
                <p className="font-display text-base font-semibold text-ink-900">{c.title}</p>
                <p className="line-clamp-2 flex-1 text-sm text-ink-500">{c.description}</p>
                <div className="flex items-center justify-between text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {c.enrolledCount} learners
                  </span>
                  <span>{c.lessonCount} lessons</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
