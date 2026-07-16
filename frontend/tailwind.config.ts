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
        // Antigravity-style deep space surfaces + violet/iris accents (dark theme)
        void: {
          DEFAULT: '#07060e',
          950: '#07060e',
          900: '#0b0a16',
          800: '#12101f',
          700: '#1b1830',
          600: '#272248',
        },
        iris: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
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
        lift: '0 8px 24px -6px rgba(15,18,41,0.12), 0 18px 48px -12px rgba(67,56,202,0.18)',
        glow: '0 10px 30px -8px rgba(67,56,202,0.45)',
        'glow-iris': '0 10px 40px -6px rgba(139,92,246,0.55)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #4338ca 0%, #5b5fef 55%, #6366f1 100%)',
        'iris-gradient': 'linear-gradient(120deg, #7c3aed 0%, #8b5cf6 45%, #d946ef 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
