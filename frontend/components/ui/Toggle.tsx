'use client';

import { cn } from '@/common/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={cn('flex items-center justify-between gap-4', disabled && 'opacity-60')}>
      <span className="flex flex-col">
        {label && <span className="text-sm font-medium text-ink-900">{label}</span>}
        {description && <span className="text-xs text-ink-500">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-ink-900/20',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </label>
  );
}
