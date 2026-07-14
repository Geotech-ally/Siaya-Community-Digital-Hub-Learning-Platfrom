import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';
import { PlatformLogo } from './PlatformLogo';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';

const departments = [
  'Basic ICT Skills',
  'Design Courses',
  'Marketing Courses',
  'Computer Science Courses',
  'Data Science and AI Courses',
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
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'Twitter', href: '#', icon: Twitter },
  { label: 'Instagram', href: '#', icon: Instagram },
];

const contactDetails = [
  { label: 'Location', value: 'Bondo Town, Siaya County, Kenya', icon: MapPin },
  { label: 'Contact', value: '+254 754 951 128', icon: Phone },
  { label: 'Email', value: 'info@siayacommunitydigitalhub.or.ke', icon: Mail },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-900 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label={`${PLATFORM_NAME} home`}>
              <PlatformLogo size="sm" />
              <span className="font-display text-sm font-semibold text-white">{PLATFORM_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              Welcome to the Siaya Community Digital Hub Learning Platform, a transformative initiative dedicated to
              bridging the digital divide and empowering the people of Siaya, Kenya
            </p>
            <ul className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-ink-300 transition-colors hover:bg-brand-600 hover:text-white"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Departments</h3>
            <ul className="mt-4 space-y-2.5">
              {departments.map((item) => (
                <li key={item}>
                  <Link href="/departments" className="text-sm text-ink-300 transition-colors hover:text-white">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3">
              {contactDetails.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" aria-hidden="true" />
                    <span className="text-sm text-ink-300">{item.value}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Partners</h3>
            <ul className="mt-4 space-y-2.5">
              {partners.map((item) => (
                <li key={item}>
                  <span className="text-sm text-ink-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-ink-300">
            &copy; {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
