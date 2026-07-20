'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Plus, Trash2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { quizzesService } from '@/lib/services/quizzes.service';
import { coursesService } from '@/lib/services/courses.service';
import type { Course, Quiz, QuizQuestion, QuestionType } from '@/types';

function emptyQuestion(): QuizQuestion {
  const oid = () => Math.random().toString(36).slice(2, 8);
  const a = oid();
  const b = oid();
  return {
    id: oid(),
    prompt: '',
    type: 'SINGLE_CHOICE',
    options: [
      { id: a, text: '' },
      { id: b, text: '' },
    ],
    correctOptionIds: [],
    points: 1,
  };
}

export default function TrainerQuizzesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    coursesService.list({ pageSize: 50 }).then((r) => {
      setCourses(r.data);
      if (r.data.length) setCourseId(r.data[0].id);
    });
  }, []);

  function load(id: string) {
    if (!id) return;
    setLoading(true);
    quizzesService
      .listByCourse(id)
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function remove(quizId: string) {
    await quizzesService.remove(quizId);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-64">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Button onClick={() => setBuilderOpen(true)} disabled={!courseId}>
          <Plus className="h-4 w-4" /> New quiz
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No quizzes yet" description="Build a quiz to check understanding." />
      ) : (
        <div className="flex flex-col gap-3">
          {quizzes.map((q) => (
            <Card key={q.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold text-ink-900">{q.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                  <Badge>{q.questions.length} questions</Badge>
                  <span>Pass: {q.passingScorePercent}%</span>
                  {q.timeLimitMinutes && <span>{q.timeLimitMinutes} min</span>}
                </div>
              </div>
              <button
                onClick={() => remove(q.id)}
                className="rounded-lg p-2 text-ink-300 hover:bg-red-50 hover:text-danger"
                aria-label="Delete quiz"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      <QuizBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        courseId={courseId}
        onCreated={(quiz) => {
          setQuizzes((prev) => [...prev, quiz]);
          setBuilderOpen(false);
        }}
      />
    </div>
  );
}

function QuizBuilderModal({
  open,
  onClose,
  courseId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onCreated: (quiz: Quiz) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScorePercent, setPassingScorePercent] = useState(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(id: string, patch: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function addOption(qId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, options: [...q.options, { id: Math.random().toString(36).slice(2, 8), text: '' }] }
          : q
      )
    );
  }

  function toggleCorrect(qId: string, optId: string, type: QuestionType) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        if (type === 'MULTIPLE_CHOICE') {
          const has = q.correctOptionIds.includes(optId);
          return {
            ...q,
            correctOptionIds: has
              ? q.correctOptionIds.filter((id) => id !== optId)
              : [...q.correctOptionIds, optId],
          };
        }
        return { ...q, correctOptionIds: [optId] };
      })
    );
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const quiz = await quizzesService.create(courseId, {
        title,
        description,
        passingScorePercent,
        timeLimitMinutes: timeLimitMinutes || undefined,
        questions,
      });
      onCreated(quiz);
      setTitle('');
      setDescription('');
      setQuestions([emptyQuestion()]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not save the quiz.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Build a quiz" className="max-w-2xl">
      <div className="scroll-thin max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-4">
          <Input label="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Passing score (%)"
              type="number"
              min={1}
              max={100}
              value={passingScorePercent}
              onChange={(e) => setPassingScorePercent(Number(e.target.value))}
            />
            <Input
              label="Time limit (minutes, optional)"
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          <div className="flex flex-col gap-3">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-surface-subtle">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">Question {idx + 1}</p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType, correctOptionIds: [] })}
                      className="h-8 w-40 text-xs"
                    >
                      <option value="SINGLE_CHOICE">Single choice</option>
                      <option value="MULTIPLE_CHOICE">Multiple choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                    </Select>
                    {questions.length > 1 && (
                      <button
                        onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                        className="rounded-lg p-1.5 text-ink-300 hover:bg-red-50 hover:text-danger"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <Input
                  placeholder="Question prompt"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                  className="mb-3 bg-white"
                />
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type={q.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                        name={`correct-${q.id}`}
                        checked={q.correctOptionIds.includes(opt.id)}
                        onChange={() => toggleCorrect(q.id, opt.id, q.type)}
                        className="h-4 w-4 accent-brand-600"
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            options: q.options.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o)),
                          })
                        }
                        placeholder="Option text"
                        className="h-9 flex-1 bg-white"
                      />
                    </div>
                  ))}
                  {q.type !== 'TRUE_FALSE' && (
                    <button
                      onClick={() => addOption(q.id)}
                      className="mt-1 self-start text-xs font-medium text-brand-600 hover:underline"
                    >
                      + Add option
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <Input
                    label="Points"
                    type="number"
                    min={1}
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                    className="w-24 bg-white"
                  />
                </div>
              </Card>
            ))}
            <button
              onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-dashed border-ink-900/20 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-subtle"
            >
              <Plus className="h-4 w-4" /> Add question
            </button>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          <Button onClick={submit} isLoading={submitting} disabled={!title || !courseId}>
            Save quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
}
