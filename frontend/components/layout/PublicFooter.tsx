import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { contactDetails, socialLinks } from '@/lib/contact';
import { departments, partners } from '@/constants/contact';
import { navLinks } from './PublicNavbar';
import { PlatformLogo } from './PlatformLogo';

const socialIcons = { facebook: Facebook, twitter: Twitter, instagram: Instagram };
const contactIcons = { location: MapPin, phone: Phone, email: Mail };

export function PublicFooter() {
  const quickLinks = navLinks;

  return (
    <footer className="border-t border-white/10 bg-ink-900 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label={`${PLATFORM_NAME} home`}>
              <PlatformLogo size="sm" />
              <span className="font-display text-sm font-semibold text-white">{PLATFORM_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              Welcome to the Siaya Community Digital Hub Learning Platform, a transformative initiative dedicated to
              bridging the digital divide and empowering the people of Siaya, Kenya
            </p>

            <ul className="mt-6 space-y-3">
              {contactDetails.map((item) => {
                const Icon = contactIcons[item.type];
                return (
                  <li key={item.label} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" aria-hidden="true" />
                    <span className="text-sm text-ink-300">{item.value}</span>
                  </li>
                );
              })}
            </ul>

            <ul className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = socialIcons[item.type];
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
            <h3 className="font-display text-sm font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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

          {partners.length > 0 && (
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
          )}
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
