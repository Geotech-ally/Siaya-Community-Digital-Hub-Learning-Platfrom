'use client';

import { Sparkles } from 'lucide-react';
import { ComingSoonPanel } from '@/components/ui/ComingSoon';

export default function LearnerAIAssistantPage() {
  return (
    <ComingSoonPanel
      icon={Sparkles}
      title="AI Learning Assistant"
      description="Ask questions, get lesson summaries, and generate practice questions. We're wiring this up to a real AI model — check back soon."
    />
  );
}
