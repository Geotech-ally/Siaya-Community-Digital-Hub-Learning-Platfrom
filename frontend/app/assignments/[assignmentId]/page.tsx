'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { assignmentsService } from '@/lib/services/assignments.service';
import type { Assignment } from '@/types';
import { formatDate } from '@/common/utils/format';

export default function AssignmentSubmissionPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const router = useRouter();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [textResponse, setTextResponse] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    assignmentsService
      .get(assignmentId)
      .then(setAssignment)
      .finally(() => setLoading(false));
  }, [assignmentId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await assignmentsService.submit(assignmentId, { textResponse, fileUrl: fileUrl || undefined });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not submit your assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !assignment) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">{assignment.title}</h1>
        <p className="mt-1 text-sm text-ink-500">
          Due {formatDate(assignment.dueDate)} · {assignment.maxScore} points
        </p>

        <Card className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{assignment.instructions}</Card>

        {submitted ? (
          <Card className="mt-5 flex items-center gap-3 border-green-200 bg-green-50">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <p className="text-sm font-medium text-ink-900">Your submission has been received.</p>
          </Card>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <Textarea
              label="Your response"
              placeholder="Write your answer here…"
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              className="min-h-[160px]"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-700">Attachment link (optional)</label>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-ink-300" />
                <input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://…"
                  className="h-10 flex-1 rounded-xl border border-ink-900/15 px-3 text-sm"
                />
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" isLoading={submitting} disabled={!textResponse && !fileUrl}>
              Submit assignment
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
