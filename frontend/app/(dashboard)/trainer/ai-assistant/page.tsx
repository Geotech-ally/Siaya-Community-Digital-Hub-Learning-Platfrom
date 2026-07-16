'use client';

import { Sparkles } from 'lucide-react';
import { ComingSoonPanel } from '@/components/ui/ComingSoon';

export default function TrainerAIAssistantPage() {
  return (
    <ComingSoonPanel
      icon={Sparkles}
      title="AI Teaching Assistant"
      description="Draft lesson ideas, quiz questions, and feedback with AI assistance. We're wiring this up to a real AI model — check back soon."
    />
  );
}
