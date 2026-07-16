'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', toggle: () => {} });

export function usePublicTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = 'sicodihub-public-theme';

/**
 * Theme provider scoped to the public marketing pages only. Applies the `dark`
 * class to a wrapper (not <html>), so the authenticated dashboard is unaffected.
 * Defaults to the dark, Antigravity-style aesthetic.
 */
export function PublicThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div
        className={
          theme === 'dark'
            ? 'dark min-h-screen bg-void-950 text-slate-200'
            : 'min-h-screen bg-white text-ink-900'
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
