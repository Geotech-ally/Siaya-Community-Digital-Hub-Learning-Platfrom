'use client';

import { MessageSquare } from 'lucide-react';
import { ComingSoonPanel } from '@/components/ui/ComingSoon';

// Messaging has no backend yet (no messages module on the NestJS side).
// Shown as "coming soon" until a real API surface (REST + websocket, or a
// messages.service.ts) exists.
export default function TrainerMessagesPage() {
  return (
    <ComingSoonPanel
      icon={MessageSquare}
      title="Messages"
      description="Direct messaging between trainers and learners is on the way. This feature isn't available yet."
    />
  );
}
