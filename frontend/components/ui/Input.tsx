import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/common/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-10 rounded-xl border border-ink-900/15 bg-white px-3 text-sm text-ink-900',
            'placeholder:text-ink-300 focus:border-brand-500',
            error && 'border-danger',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
