'use client';

import { useRef, useState } from 'react';
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { aiService } from '@/lib/services/ai.service';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function AIAssistantPanel({
  title = 'AI Learning Assistant',
  placeholder = 'Ask about a lesson, concept, or how to get unstuck…',
  courseId,
  context,
}: {
  title?: string;
  placeholder?: string;
  courseId?: string;
  context?: string;
}) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your AI learning assistant. Ask me to explain a concept, summarize a lesson, or suggest practice questions.",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const question = draft.trim();
    if (!question) return;
    const userMsg: AIMessage = { id: Math.random().toString(36).slice(2), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setLoading(true);
    try {
      const { answer } = await aiService.ask({ question, courseId, context });
      setMessages((prev) => [...prev, { id: Math.random().toString(36).slice(2), role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          role: 'assistant',
          text: "I couldn't reach the AI service just now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <Card className="flex h-[calc(100vh-8.5rem)] flex-col p-0">
      <div className="flex items-center gap-2 border-b border-ink-900/8 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
          <Sparkles className="h-4 w-4 text-brand-600" />
        </div>
        <p className="font-display text-sm font-semibold text-ink-900">{title}</p>
      </div>
      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-700'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`max-w-md rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-900'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <p className="pl-9 text-xs text-ink-500">Thinking…</p>}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-ink-900/8 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-xl border border-ink-900/15 px-3 text-sm"
        />
        <button
          onClick={send}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
