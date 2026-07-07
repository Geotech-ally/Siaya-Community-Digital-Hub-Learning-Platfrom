'use client';

import { useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { assignmentsService } from '@/lib/services/assignments.service';
import { coursesService } from '@/lib/services/courses.service';
import type { Assignment, AssignmentSubmission, Course } from '@/types';
import { formatRelative } from '@/common/utils/format';

export default function TrainerGradingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesService.list({ pageSize: 50 }).then((r) => {
      setCourses(r.data);
      if (r.data.length) setCourseId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    assignmentsService.listByCourse(courseId).then((data) => {
      setAssignments(data);
      if (data.length) setAssignmentId(data[0].id);
      else setAssignmentId('');
    });
  }, [courseId]);

  useEffect(() => {
    if (!assignmentId) {
      setSubmissions([]);
      return;
    }
    setLoading(true);
    assignmentsService
      .listSubmissions(assignmentId, { pageSize: 50 })
      .then((r) => setSubmissions(r.data))
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  async function grade(submissionId: string, grade: number, feedback: string) {
    const updated = await assignmentsService.grade(submissionId, { grade, feedback });
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-56">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="w-56">
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Nothing to grade yet" description="Submissions will appear here once learners submit." />
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <SubmissionRow key={s.id} submission={s} onGrade={grade} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({
  submission,
  onGrade,
}: {
  submission: AssignmentSubmission;
  onGrade: (id: string, grade: number, feedback: string) => Promise<void>;
}) {
  const [grade, setGrade] = useState(submission.grade ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await onGrade(submission.id, grade, feedback);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-ink-900">{submission.learnerName ?? submission.learnerId}</p>
        <Badge tone={submission.status === 'GRADED' ? 'success' : submission.status === 'LATE' ? 'warning' : 'brand'}>
          {submission.status}
        </Badge>
      </div>
      {submission.textResponse && <p className="text-sm text-ink-700">{submission.textResponse}</p>}
      {submission.fileUrl && (
        <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
          View submitted file
        </a>
      )}
      <p className="text-xs text-ink-500">Submitted {formatRelative(submission.submittedAt)}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input label="Grade" type="number" min={0} value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="w-28" />
        <Input label="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="flex-1" />
        <Button onClick={save} isLoading={saving} size="sm">
          Save grade
        </Button>
      </div>
    </Card>
  );
}
