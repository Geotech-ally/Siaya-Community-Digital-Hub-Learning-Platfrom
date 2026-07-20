'use client';

import { useEffect, useState } from 'react';
import { Award, Download, Linkedin, Mail, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Textarea } from '@/components/ui/Textarea';
import { certificatesService } from '@/lib/services/certificates.service';
import type { Certificate } from '@/types';
import { formatDate } from '@/common/utils/format';

export default function LearnerCertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareTarget, setShareTarget] = useState<Certificate | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function load() {
    setLoading(true);
    certificatesService
      .myCertificates()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function download(cert: Certificate) {
    const a = document.createElement('a');
    a.href = certificatesService.fileUrl(cert.id);
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }

  async function openShare(cert: Certificate) {
    setShareTarget(cert);
    setEmail('');
    setMessage('');
    setFeedback(null);
  }

  async function sendEmail() {
    if (!shareTarget) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await certificatesService.shareEmail(shareTarget.id, email, message);
      setFeedback(`Sent! Verification link: ${res.verifyUrl}`);
    } catch {
      setFeedback('Could not send email. Check the address and try again.');
    } finally {
      setSending(false);
    }
  }

  async function shareLinkedIn() {
    if (!shareTarget) return;
    const res = await certificatesService.shareLinkedIn(shareTarget.id);
    window.open(res.url, '_blank', 'noopener');
  }

  function copyLink() {
    if (!shareTarget?.shareUrl) return;
    navigator.clipboard?.writeText(shareTarget.shareUrl);
    setFeedback('Verification link copied to clipboard.');
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title="No certificates yet"
        description="Complete a course (all lessons, quizzes, and assignments) to earn your certificate."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50">
              <Award className="h-5 w-5 text-accent-600" />
            </div>
            <p className="font-display text-base font-semibold text-ink-900">{c.courseTitle}</p>
            <p className="text-xs text-ink-500">Issued {formatDate(c.issuedAt)}</p>
            {c.certificateNo && (
              <p className="text-xs text-ink-400">No. {c.certificateNo}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => download(c)}>
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => openShare(c)}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!shareTarget} onClose={() => setShareTarget(null)} title="Share certificate">
        {shareTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-500">
              Share your <span className="font-medium text-ink-900">{shareTarget.courseTitle}</span> certificate.
            </p>

            <div className="flex flex-col gap-2">
              <Input
                label="Recipient email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
              />
              <Textarea
                label="Message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <Button onClick={sendEmail} isLoading={sending} disabled={!email}>
                <Mail className="h-4 w-4" /> Send by email
              </Button>
            </div>

            <div className="flex flex-col gap-2 border-t border-ink-900/8 pt-4">
              <Button variant="outline" onClick={shareLinkedIn}>
                <Linkedin className="h-4 w-4" /> Share on LinkedIn
              </Button>
              {shareTarget.shareUrl && (
                <Button variant="ghost" onClick={copyLink}>
                  Copy verification link
                </Button>
              )}
              {shareTarget.shareUrl && (
                <a
                  href={shareTarget.shareUrl}
                  target="_blank"
                  rel="noopener"
                  className="truncate text-xs text-brand-600 hover:underline"
                >
                  {shareTarget.shareUrl}
                </a>
              )}
            </div>

            {feedback && <p className="text-sm text-success">{feedback}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
