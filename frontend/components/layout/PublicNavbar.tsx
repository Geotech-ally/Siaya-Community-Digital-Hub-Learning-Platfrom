'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X, Laptop, PenTool, Megaphone, Code2, Database } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/brand';
import { PlatformLogo } from './PlatformLogo';
import { ThemeToggle } from './ThemeToggle';

const departments = [
  { label: 'Basic ICT Skills', icon: Laptop },
  { label: 'Design Courses', icon: PenTool },
  { label: 'Marketing Courses', icon: Megaphone },
  { label: 'Computer Science', icon: Code2 },
  { label: 'Data Science & AI', icon: Database },
];

export function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false); // mobile
  const [deptOpen, setDeptOpen] = useState(false); // desktop mega-menu sheet

  useEffect(() => {
    if (!deptOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDeptOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deptOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* Dim the page while the mega-menu sheet is open */}
      {deptOpen && (
        <div
          aria-hidden="true"
          onClick={() => setDeptOpen(false)}
          className="fixed inset-0 -z-10 hidden bg-ink-900/20 md:block"
        />
      )}

      {/* The whole header expands into a full-width sheet when open */}
      <div
        onMouseLeave={() => setDeptOpen(false)}
        className={`bg-white/95 backdrop-blur-xl transition-shadow dark:bg-void-950/95 ${
          deptOpen
            ? 'rounded-b-3xl shadow-popover dark:border-b dark:border-white/10'
            : 'border-b border-ink-900/5 dark:border-white/5'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${PLATFORM_NAME} home`}>
            <PlatformLogo size="sm" priority />
            <span className="font-display text-sm font-semibold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-base">
              {PLATFORM_NAME}
            </span>
          </Link>

          {/* Left-aligned link cluster, Antigravity style */}
          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/about">About Us</NavLink>
            <button
              type="button"
              aria-expanded={deptOpen}
              onMouseEnter={() => setDeptOpen(true)}
              onClick={() => setDeptOpen((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                deptOpen
                  ? 'text-ink-900 dark:text-white'
                  : 'text-ink-700 hover:bg-surface-subtle hover:text-ink-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
              }`}
            >
              Departments
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${deptOpen ? 'rotate-180' : ''}`} />
            </button>
            <NavLink href="/contact">Contact Us</NavLink>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link
              href="/register"
              className="inline-flex items-center rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-ink-900"
            >
              Enroll Now
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-2 hover:bg-surface-subtle dark:hover:bg-white/5"
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-ink-700 dark:text-slate-300" />
              ) : (
                <Menu className="h-5 w-5 text-ink-700 dark:text-slate-300" />
              )}
            </button>
          </div>
        </nav>

        {/* Full-width mega-menu sheet */}
        {deptOpen && (
          <div className="hidden animate-fade-up md:block">
            <div className="mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
              <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
                <div>
                  <p className="max-w-xs font-display text-2xl font-semibold leading-snug tracking-tight text-ink-900 dark:text-white sm:text-3xl">
                    Explore our learning departments
                  </p>
                  <Link
                    href="/departments"
                    onClick={() => setDeptOpen(false)}
                    className="mt-7 inline-flex items-center rounded-full bg-surface-muted px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-900 hover:text-white dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-ink-900"
                  >
                    See all departments
                  </Link>
                </div>

                <div className="border-l border-ink-900/10 pl-12 dark:border-white/10">
                  <p className="text-sm text-ink-500 dark:text-slate-400">Departments</p>
                  <ul className="mt-5 space-y-4">
                    {departments.map((d) => {
                      const Icon = d.icon;
                      return (
                        <li key={d.label}>
                          <Link
                            href="/departments"
                            onClick={() => setDeptOpen(false)}
                            className="group inline-flex items-center gap-3 text-[15px] font-medium text-ink-900 transition-colors hover:text-brand-700 dark:text-slate-200 dark:hover:text-iris-300"
                          >
                            <Icon className="h-[18px] w-[18px] text-ink-700 transition-colors group-hover:text-brand-700 dark:text-slate-400 dark:group-hover:text-iris-300" />
                            {d.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="border-t border-ink-900/5 bg-white px-4 py-3 dark:border-white/10 dark:bg-void-900 md:hidden">
          <div className="flex flex-col gap-1">
            {[
              { label: 'Home', href: '/' },
              { label: 'About Us', href: '/about' },
              { label: 'Departments', href: '/departments' },
              { label: 'Contact Us', href: '/contact' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-subtle dark:text-slate-300 dark:hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-ink-900"
            >
              Enroll Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-subtle hover:text-ink-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}
