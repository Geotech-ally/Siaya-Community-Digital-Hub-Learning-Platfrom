'use client';

import { Moon, Sun } from 'lucide-react';
import { usePublicTheme } from './PublicThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = usePublicTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
        isDark
          ? 'border-white/10 bg-white/5 text-iris-300 hover:bg-white/10'
          : 'border-ink-900/10 bg-white text-ink-700 hover:bg-surface-subtle'
      } ${className}`}
    >
      {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}
