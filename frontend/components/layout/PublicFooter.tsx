import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';
import { PlatformLogo } from './PlatformLogo';

const departments = [
  'Basic ICT Skills',
  'Marketing Skills',
  'Design Skills',
  'Data Science and AI',
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
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2" aria-label={`${PLATFORM_NAME} home`}>
              <PlatformLogo size="sm" />
              <span className="font-display text-sm font-semibold text-ink-900">{PLATFORM_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-500">
              Empowering Siaya learners with market-ready digital skills across ICT, design, business, and technology.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-ink-900">Socials</h3>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-ink-500 transition-colors hover:text-brand-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
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
