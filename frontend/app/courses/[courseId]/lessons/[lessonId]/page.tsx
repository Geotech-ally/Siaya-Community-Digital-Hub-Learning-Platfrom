'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Link2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { lessonsService } from '@/lib/services/lessons.service';
import type { Lesson } from '@/types';

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([lessonsService.listByCourse(courseId), lessonsService.get(courseId, lessonId)])
      .then(([all, current]) => {
        setLessons(all.sort((a, b) => a.order - b.order));
        setLesson(current);
      })
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  async function markComplete() {
    setCompleting(true);
    try {
      await lessonsService.markComplete(courseId, lessonId);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  }

  if (loading || !lesson) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Skeleton className="h-96" />
      </div>
    );
  }

  const idx = lessons.findIndex((l) => l.id === lessonId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">{lesson.title}</h1>

        {lesson.videoUrl && (
          <div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-ink-900">
            <video src={lesson.videoUrl} controls className="h-full w-full" />
          </div>
        )}

        <Card className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">{lesson.content}</Card>

        {lesson.resources?.length > 0 && (
          <Card className="mt-4">
            <p className="mb-2 text-sm font-semibold text-ink-900">Resources</p>
            <div className="flex flex-col gap-2">
              {lesson.resources.map((r) => (
                <a
                  key={r.id}
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-600 hover:underline"
                >
                  {r.type === 'LINK' ? <Link2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {r.title}
                </a>
              ))}
            </div>
          </Card>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div>
            {prev && (
              <Link href={`/courses/${courseId}/lessons/${prev.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
              </Link>
            )}
          </div>
          <Button onClick={markComplete} isLoading={completing} disabled={completed} variant={completed ? 'outline' : 'primary'}>
            <CheckCircle2 className="h-4 w-4" /> {completed ? 'Completed' : 'Mark as complete'}
          </Button>
          <div>
            {next && (
              <Link href={`/courses/${courseId}/lessons/${next.id}`}>
                <Button variant="outline" size="sm">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
