import { cn } from '@/common/utils/cn';

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-ink-900/8', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
