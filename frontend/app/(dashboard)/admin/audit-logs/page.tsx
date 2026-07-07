'use client';

import { useEffect, useState } from 'react';
import { ScrollText, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, Thead, Tr, Th, Td } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { analyticsService } from '@/lib/services/analytics.service';
import { useDebounce } from '@/common/hooks/useDebounce';
import type { AuditLogEntry } from '@/types';
import { formatDate } from '@/common/utils/format';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounced = useDebounce(search, 350);

  useEffect(() => {
    setLoading(true);
    analyticsService
      .auditLogs({ search: debounced || undefined, pageSize: 50 })
      .then((r) => setLogs(r.data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <Input
          placeholder="Search actions, actors, targets"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={ScrollText} title="No audit entries found" />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Target</Th>
                <Th>When</Th>
              </Tr>
            </Thead>
            <tbody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td className="font-medium text-ink-900">{log.actorName}</Td>
                  <Td className="font-mono text-xs">{log.action}</Td>
                  <Td>
                    {log.targetType} · {log.targetId}
                  </Td>
                  <Td>{formatDate(log.createdAt, 'MMM d, yyyy p')}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
