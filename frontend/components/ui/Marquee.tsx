'use client';

import { cn } from '@/common/utils/cn';

type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
};

const speedClass = {
  slow: 'animate-marquee [animation-duration:40s]',
  normal: 'animate-marquee [animation-duration:28s]',
  fast: 'animate-marquee [animation-duration:18s]',
};

export function Marquee({ children, className, speed = 'normal' }: MarqueeProps) {
  return (
    <div
      className={cn('relative overflow-hidden border-b border-brand-700/30 bg-brand-900', className)}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-brand-900 to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-brand-900 to-transparent sm:w-20" />
      <div className={cn('flex w-max whitespace-nowrap', speedClass[speed])}>
        <div className="flex shrink-0 items-center gap-8 px-6 py-3 sm:gap-12 sm:px-8 sm:py-4">{children}</div>
        <div className="flex shrink-0 items-center gap-8 px-6 py-3 sm:gap-12 sm:px-8 sm:py-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MarqueeContent() {
  return (
    <>
      <span className="font-display text-sm font-semibold text-white sm:text-base">
        Learn something new. Teach what you know. Track it all in one place.
      </span>
      <span className="text-brand-300" aria-hidden="true">
        •
      </span>
      <span className="text-sm text-brand-200 sm:text-base">
        Courses across ICT, design, marketing, computer science, and data &amp; AI, with quizzes, assignments, and
        certificates built in.
      </span>
    </>
  );
}
