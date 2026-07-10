'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { enrollmentsService } from '@/lib/services/enrollments.service';
import { coursesService } from '@/lib/services/courses.service';
import type { Course, Enrollment } from '@/types';

// Messaging UI. Wire `sendMessage` and the message feed to a real
// backend endpoint (e.g. REST + websocket, or a messages.service.ts)
// once that API surface exists on the NestJS side.
interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  at: string;
}

export default function TrainerMessagesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [learners, setLearners] = useState<Enrollment[]>([]);
  const [activeLearnerId, setActiveLearnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    coursesService.list({ pageSize: 50 }).then((r) => {
      setCourses(r.data);
      if (r.data.length) setCourseId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    enrollmentsService.listByCourse(courseId, { pageSize: 50 }).then((r) => setLearners(r.data));
  }, [courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    if (!draft.trim() || !activeLearnerId) return;
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), from: 'me', text: draft.trim(), at: new Date().toISOString() },
    ]);
    setDraft('');
  }

  const activeLearner = learners.find((l) => l.learnerId === activeLearnerId);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      <Card className="w-64 shrink-0 overflow-y-auto p-0">
        <div className="border-b border-ink-900/8 p-3">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="h-9 w-full rounded-lg border border-ink-900/15 px-2 text-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="p-1.5">
          {learners.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setActiveLearnerId(l.learnerId);
                setMessages([]);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeLearnerId === l.learnerId ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-surface-subtle'
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {(l.learnerName ?? '?').charAt(0)}
              </div>
              {l.learnerName ?? l.learnerId}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-1 flex-col p-0">
        {!activeLearner ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState icon={MessageSquare} title="Select a learner" description="Choose someone from the list to start messaging." />
          </div>
        ) : (
          <>
            <div className="border-b border-ink-900/8 px-4 py-3">
              <p className="font-medium text-ink-900">{activeLearner.learnerName ?? activeLearner.learnerId}</p>
              <p className="text-xs text-ink-500">{activeLearner.courseTitle}</p>
            </div>
            <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-ink-500">No messages yet. Say hello!</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                        m.from === 'me' ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-900'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-ink-900/8 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Write a message…"
                className="h-10 flex-1 rounded-xl border border-ink-900/15 px-3 text-sm"
              />
              <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
