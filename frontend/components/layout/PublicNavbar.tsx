import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/brand';
import { PlatformLogo } from './PlatformLogo';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Departments', href: '/departments' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Enroll Now', href: '/register', cta: true },
];

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/8 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label={`${PLATFORM_NAME} home`}>
          <PlatformLogo size="sm" priority />
          <span className="font-display text-sm font-semibold leading-tight text-ink-900 sm:text-base">
            {PLATFORM_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.cta ? (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-700 transition-colors hover:text-brand-600"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="relative md:hidden">
          <input id="public-mobile-menu" type="checkbox" className="peer sr-only" aria-label="Toggle menu" />
          <label
            htmlFor="public-mobile-menu"
            className="flex cursor-pointer rounded-lg p-2 hover:bg-surface-subtle peer-checked:hidden"
          >
            <Menu className="h-5 w-5 text-ink-700" aria-hidden="true" />
          </label>
          <label
            htmlFor="public-mobile-menu"
            className="hidden cursor-pointer rounded-lg p-2 hover:bg-surface-subtle peer-checked:flex"
          >
            <X className="h-5 w-5 text-ink-700" aria-hidden="true" />
          </label>

          <div className="absolute right-0 top-12 hidden w-56 rounded-2xl border border-ink-900/8 bg-white p-3 shadow-popover peer-checked:block">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    link.cta
                      ? 'mt-2 inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700'
                      : 'rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-subtle hover:text-brand-600'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
