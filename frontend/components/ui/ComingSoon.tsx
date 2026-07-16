import { Clock, LucideIcon } from 'lucide-react';
import { cn } from '@/common/utils/cn';

/**
 * Small pill used to mark a feature that is planned but not yet implemented.
 * Pair with a disabled control (button, nav item) so users can see the feature
 * is coming without being able to trigger the unfinished behavior.
 */
export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      Soon
    </span>
  );
}

/**
 * Full-panel placeholder for a page whose feature is not implemented yet.
 * Renders in place of the (unfinished) interactive UI.
 */
export function ComingSoonPanel({
  icon: Icon = Clock,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink-900/15 bg-surface-subtle/40 p-8 text-center">
      <div className="rounded-full bg-amber-50 p-4">
        <Icon className="h-7 w-7 text-amber-600" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <ComingSoonBadge />
        <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
        {description && <p className="max-w-md text-sm text-ink-500">{description}</p>}
      </div>
    </div>
  );
}
