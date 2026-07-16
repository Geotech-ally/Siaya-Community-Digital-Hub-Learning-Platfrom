'use client';

import { useEffect, useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { certificatesService } from '@/lib/services/certificates.service';
import { formatDate } from '@/common/utils/format';
import { PLATFORM_NAME } from '@/lib/brand';

export default function VerifyCertificatePage({
  params,
}: {
  params: { certificateNo: string };
}) {
  const [data, setData] = useState<{
    valid: boolean;
    courseTitle: string;
    learnerName: string;
    issuedAt: string;
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    certificatesService
      .verify(params.certificateNo)
      .then(setData)
      .catch(() => setError(true));
  }, [params.certificateNo]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-subtle p-4">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50">
          <Award className="h-7 w-7 text-accent-600" />
        </div>
        <p className="text-xs uppercase tracking-wide text-ink-400">{PLATFORM_NAME}</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-ink-900">
          Certificate Verification
        </h1>

        {error && (
          <p className="mt-4 text-sm text-danger">This certificate could not be verified.</p>
        )}

        {!error && !data && <Skeleton className="mx-auto mt-4 h-24 w-full" />}

        {data && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-base font-medium text-ink-900">
              {data.learnerName}
            </p>
            <p className="text-sm text-ink-500">
              successfully completed
            </p>
            <p className="font-display text-lg font-semibold text-brand-700">
              {data.courseTitle}
            </p>
            <p className="text-xs text-ink-400">
              Issued {formatDate(data.issuedAt)} · No. {params.certificateNo}
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}
