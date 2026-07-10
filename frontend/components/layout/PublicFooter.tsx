'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { PLATFORM_NAME } from '@/lib/brand';

const departments = [
  'Basic ICT Skills',
  'Marketing Skills',
  'Design Skills',
  'Data Science & AI',
  'Computer Science Courses',
  'Networking Courses',
  'CCTV',
];

const partners = [
  'Ministry of ICT and Digital Economy',
  'Konza Technopolis',
  'ICT Authority',
  'BuuPass',
  'Kenya Films',
  'Kenya Institute of Mass Communication',
];

const socialLinks = [
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Twitter', href: '#' },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-ink-900/8 bg-surface-subtle">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-sm font-semibold text-ink-900">
                {PLATFORM_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-500">
              {PLATFORM_NAME} — empowering learners with market-ready digital skills across ICT, design, and technology.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-ink-900">Departments</h3>
            <ul className="mt-4 space-y-2.5">
              {departments.map((item) => (
                <li key={item}>
                  <span className="text-sm text-ink-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-ink-900">Partners</h3>
            <ul className="mt-4 space-y-2.5">
              {partners.map((item) => (
                <li key={item}>
                  <span className="text-sm text-ink-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-ink-900">Social Media</h3>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-500 transition-colors hover:text-brand-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-ink-900/8 pt-8">
          <p className="text-center text-sm text-ink-500">
            &copy; {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
