'use client';

import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, Thead, Tr, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { enrollmentsService } from '@/lib/services/enrollments.service';
import type { Enrollment } from '@/types';
import { formatDate } from '@/common/utils/format';

const statusTone = {
  ACTIVE: 'brand',
  COMPLETED: 'success',
  DROPPED: 'danger',
} as const;

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    enrollmentsService
      .all({ status: status || undefined, pageSize: 50 })
      .then((r) => setEnrollments(r.data))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="flex flex-col gap-4">
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="DROPPED">Dropped</option>
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
            <EmptyState icon={ClipboardList} title="No enrollments found" />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Learner</Th>
                <Th>Course</Th>
                <Th>Progress</Th>
                <Th>Status</Th>
                <Th>Enrolled</Th>
              </Tr>
            </Thead>
            <tbody>
              {enrollments.map((e) => (
                <Tr key={e.id}>
                  <Td className="font-medium text-ink-900">{e.learnerName ?? e.learnerId}</Td>
                  <Td>{e.courseTitle}</Td>
                  <Td className="w-48">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={e.progressPercent} className="w-28" />
                      <span className="text-xs text-ink-500">{Math.round(e.progressPercent)}%</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={statusTone[e.status]}>{e.status}</Badge>
                  </Td>
                  <Td>{formatDate(e.enrolledAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
