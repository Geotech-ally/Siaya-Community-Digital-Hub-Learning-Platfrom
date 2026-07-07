'use client';

import { useEffect, useState } from 'react';
import { Award, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { certificatesService } from '@/lib/services/certificates.service';
import type { Certificate } from '@/types';
import { formatDate } from '@/common/utils/format';

export default function LearnerCertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificatesService
      .myCertificates()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function download(cert: Certificate) {
    const blob = await certificatesService.download(cert.id);
    const url = window.URL.createObjectURL(blob as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.courseTitle.replace(/\s+/g, '-')}-certificate.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No certificates yet"
        description="Complete a course to earn your first certificate."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <Card key={c.id} className="flex flex-col gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50">
            <Award className="h-5 w-5 text-accent-600" />
          </div>
          <p className="font-display text-base font-semibold text-ink-900">{c.courseTitle}</p>
          <p className="text-xs text-ink-500">Issued {formatDate(c.issuedAt)}</p>
          <Button variant="outline" size="sm" onClick={() => download(c)} className="mt-1 w-fit">
            <Download className="h-4 w-4" /> Download
          </Button>
        </Card>
      ))}
    </div>
  );
}
