'use client';

import { useEffect, useState } from 'react';
import { LineChart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, Thead, Tr, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { coursesService } from '@/lib/services/courses.service';
import { enrollmentsService } from '@/lib/services/enrollments.service';
import type { Course, Enrollment } from '@/types';

export default function TrainerProgressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesService.list({ pageSize: 50 }).then((r) => {
      setCourses(r.data);
      if (r.data.length) setCourseId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    enrollmentsService
      .listByCourse(courseId, { pageSize: 50 })
      .then((r) => setEnrollments(r.data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="flex flex-col gap-4">
      <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-64">
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </Select>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={LineChart} title="No learners enrolled yet" />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Learner</Th>
                <Th>Progress</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {enrollments.map((e) => (
                <Tr key={e.id}>
                  <Td className="font-medium text-ink-900">{e.learnerName ?? e.learnerId}</Td>
                  <Td className="w-64">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={e.progressPercent} className="w-40" />
                      <span className="text-xs text-ink-500">{Math.round(e.progressPercent)}%</span>
                    </div>
                  </Td>
                  <Td>{e.status}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
