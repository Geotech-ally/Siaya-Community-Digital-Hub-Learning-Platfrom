'use client';

import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tr, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { certificatesService } from '@/lib/services/certificates.service';
import type { Certificate } from '@/types';
import { formatDate } from '@/common/utils/format';

export default function AdminCertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificatesService
      .allCertificates({ pageSize: 50 })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="p-0">
      {loading ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-6">
          <EmptyState icon={Award} title="No certificates issued yet" description="Certificates appear here once learners complete a course." />
        </div>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Learner</Th>
              <Th>Course</Th>
              <Th>Issued</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <tbody>
            {items.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-ink-900">{c.learnerId}</Td>
                <Td>{c.courseTitle}</Td>
                <Td>{formatDate(c.issuedAt)}</Td>
                <Td>
                  <a
                    href={certificatesService.fileUrl(c.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
