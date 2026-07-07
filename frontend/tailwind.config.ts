import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './common/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core brand — deep indigo/navy for authority, amber accent for progress & achievement
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#5b5fef',
          600: '#4338ca',
          700: '#3730a3',
          800: '#2e2a7a',
          900: '#1e1b4b',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f8f9fc',
          muted: '#eef0f7',
        },
        ink: {
          900: '#0f1229',
          700: '#31344b',
          500: '#5c5f79',
          300: '#9497ad',
        },
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#d97706',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,18,41,0.04), 0 4px 16px rgba(15,18,41,0.06)',
        popover: '0 8px 30px rgba(15,18,41,0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
