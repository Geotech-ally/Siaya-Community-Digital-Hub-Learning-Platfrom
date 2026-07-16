'use client';

import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { contactEmail } from '@/constants/contact';

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  support: 'Technical Support',
  partnerships: 'Partnerships',
  feedback: 'Feedback',
};

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subjectLine = SUBJECT_LABELS[subject] ?? subject;
    const body = [`From: ${name}`, `Email: ${email}`, '', message].join('\n');
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-ink-700">
            Full Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-ink-700">
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-ink-700">
          Subject
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
          required
        >
          <option value="" disabled>
            Select a topic
          </option>
          <option value="general">General Inquiry</option>
          <option value="support">Technical Support</option>
          <option value="partnerships">Partnerships</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-ink-700">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Send Message
      </button>
    </form>
  );
}
