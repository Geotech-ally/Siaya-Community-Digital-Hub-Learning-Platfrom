import { PLATFORM_NAME } from '@/lib/brand';
import { MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { contactDetails, contactLocation, departments, socialLinks } from '@/constants/contact';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata = {
  title: `Contact Us · ${PLATFORM_NAME}`,
  description: 'Get in touch with the Siaya Community Digital Hub Learning Platform team.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          We&rsquo;d love to hear from you. Reach out to the {PLATFORM_NAME} team and we&rsquo;ll get back to you as
          soon as possible.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl space-y-16">
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactDetails.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-ink-900/8 bg-white p-6 text-center shadow-card"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <Icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-ink-900">{item.label}</h3>
                    <p className="mt-1 text-sm text-ink-500">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink-900">Send us a message</h2>
            <p className="mt-1 text-sm text-ink-500">
              Fill out the form below and we&rsquo;ll respond within 24 hours.
            </p>
            <ContactForm />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink-900">Departments</h2>
              <p className="mt-1 text-sm text-ink-500">
                Reach out to the right team based on your area of interest.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {departments.map((dept) => (
                  <li
                    key={dept}
                    className="rounded-xl border border-ink-900/8 bg-surface-subtle px-4 py-3 text-sm font-medium text-ink-700"
                  >
                    {dept}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink-900">Follow us</h2>
              <p className="mt-1 text-sm text-ink-500">Stay connected on our social channels.</p>
              <ul className="mt-6 flex flex-wrap items-center gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        aria-label={item.label}
                        className="inline-flex items-center gap-2 rounded-lg border border-ink-900/10 bg-surface px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="rounded-2xl border border-ink-900/8 bg-white p-2 shadow-card sm:p-3">
            <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-surface-muted">
              <div className="text-center">
                <MapPin className="mx-auto h-10 w-10 text-ink-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-ink-500">{contactLocation}</p>
                <p className="text-xs text-ink-300">
                  Map embed placeholder. Connect a map provider to display an interactive map.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
