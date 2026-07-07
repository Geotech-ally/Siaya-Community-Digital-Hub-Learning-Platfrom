'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { quizzesService } from '@/lib/services/quizzes.service';
import type { Quiz, QuizAttempt } from '@/types';

export default function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttempt | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    quizzesService
      .get(quizId)
      .then((q) => {
        setQuiz(q);
        if (q.timeLimitMinutes) setSecondsLeft(q.timeLimitMinutes * 60);
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  function toggleAnswer(questionId: string, optionId: string, multi: boolean) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (multi) {
        const has = current.includes(optionId);
        return { ...prev, [questionId]: has ? current.filter((id) => id !== optionId) : [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }

  async function submit() {
    if (!quiz || submitting || result) return;
    setSubmitting(true);
    try {
      const attempt = await quizzesService.submitAttempt(quiz.id, answers);
      setResult(attempt);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !quiz) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            result.passed ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {result.passed ? <CheckCircle2 className="h-8 w-8 text-success" /> : <XCircle className="h-8 w-8 text-danger" />}
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">
          {result.passed ? 'Great work!' : 'Not quite there yet'}
        </h1>
        <p className="mt-2 text-ink-500">
          You scored {Math.round(result.scorePercent)}% — passing score is {quiz.passingScorePercent}%.
        </p>
        <Button onClick={() => router.back()} className="mt-6">
          Back to course
        </Button>
      </div>
    );
  }

  const minutes = secondsLeft !== null ? Math.floor(secondsLeft / 60) : null;
  const seconds = secondsLeft !== null ? secondsLeft % 60 : null;

  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link href="#" onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{quiz.title}</h1>
          {secondsLeft !== null && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink-700 shadow-card">
              <Clock className="h-4 w-4" /> {minutes}:{String(seconds).padStart(2, '0')}
            </span>
          )}
        </div>
        {quiz.description && <p className="mt-2 text-sm text-ink-500">{quiz.description}</p>}

        <div className="mt-6 flex flex-col gap-4">
          {quiz.questions.map((q, idx) => (
            <Card key={q.id}>
              <p className="mb-3 font-medium text-ink-900">
                {idx + 1}. {q.prompt}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => (
                  <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-surface-subtle">
                    <input
                      type={q.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                      name={`q-${q.id}`}
                      checked={(answers[q.id] ?? []).includes(opt.id)}
                      onChange={() => toggleAnswer(q.id, opt.id, q.type === 'MULTIPLE_CHOICE')}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="text-sm text-ink-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={submit} isLoading={submitting} className="mt-6 w-full">
          Submit quiz
        </Button>
      </div>
    </div>
  );
}
