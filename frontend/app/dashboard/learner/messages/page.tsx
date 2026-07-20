'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import {
  messagesService,
  type ChatMessage,
  type ConversationSummary,
} from '@/lib/services/messages.service';
import { formatRelative } from '@/common/utils/format';

export default function LearnerMessagesPage() {
  const user = useAuthStore((s) => s.user);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesService
      .conversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function openConversation(conversation: ConversationSummary) {
    setActive(conversation);
    setLoadingThread(true);
    try {
      const thread = await messagesService.thread(conversation.courseId, conversation.counterpartId);
      setMessages(thread);
      setConversations((prev) =>
        prev.map((c) =>
          c.courseId === conversation.courseId && c.counterpartId === conversation.counterpartId
            ? { ...c, unreadCount: 0 }
            : c,
        ),
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingThread(false);
    }
  }

  async function send() {
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      const message = await messagesService.send({
        courseId: active.courseId,
        recipientId: active.counterpartId,
        body: draft.trim(),
      });
      setMessages((prev) => [...prev, message]);
      setDraft('');
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.courseId === active.courseId && c.counterpartId === active.counterpartId
            ? { ...c, lastMessage: message.body, lastMessageAt: message.createdAt }
            : c,
        );
        return next.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      <Card className="w-72 shrink-0 overflow-y-auto p-0">
        <div className="border-b border-ink-900/8 px-4 py-3">
          <p className="font-display text-sm font-semibold text-ink-900">Course messages</p>
        </div>
        <div className="p-1.5">
          {conversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-500">
              Enroll in a course to message your trainers.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={`${c.courseId}-${c.counterpartId}`}
                onClick={() => openConversation(c)}
                className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  active?.counterpartId === c.counterpartId && active?.courseId === c.courseId
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-surface-subtle'
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {c.counterpartName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{c.counterpartName}</p>
                    {c.unreadCount > 0 && (
                      <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-500">{c.courseTitle}</p>
                  {c.lastMessage && <p className="mt-0.5 truncate text-xs text-ink-300">{c.lastMessage}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </Card>

      <Card className="flex flex-1 flex-col p-0">
        {!active ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={MessageSquare}
              title="Select a trainer"
              description="Choose a conversation to message your course trainer."
            />
          </div>
        ) : (
          <>
            <div className="border-b border-ink-900/8 px-4 py-3">
              <p className="font-medium text-ink-900">{active.counterpartName}</p>
              <p className="text-xs text-ink-500">{active.courseTitle}</p>
            </div>
            <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-4">
              {loadingThread ? (
                <p className="text-center text-sm text-ink-500">Loading conversation…</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-ink-500">No messages yet. Ask a question!</p>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                          mine ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-900'
                        }`}
                      >
                        <p>{m.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-brand-100' : 'text-ink-300'}`}>
                          {formatRelative(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-ink-900/8 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !sending && send()}
                placeholder="Write a message…"
                className="h-10 flex-1 rounded-xl border border-ink-900/15 px-3 text-sm"
              />
              <button
                onClick={send}
                disabled={sending || !draft.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
