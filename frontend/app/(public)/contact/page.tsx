import { PLATFORM_NAME } from '@/lib/brand';
import { contactDetails, socialLinks } from '@/lib/contact';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const contactIcons = { location: MapPin, phone: Phone, email: Mail };
const socialIcons = { facebook: Facebook, twitter: Twitter, instagram: Instagram };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          We&rsquo;d love to hear from you. Whether you have questions about our courses, need technical support, want to
          partner with us, or have general feedback, our team is here to help. Use the contact information below or send
          us a message through the contact form.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl bg-ink-900 p-6 text-white shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Contact Information</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-300">
            Connect with the {PLATFORM_NAME} team using any of the details below.
          </p>

          <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Organization</p>
            <p className="mt-2 font-display text-lg font-semibold text-white">{PLATFORM_NAME}</p>
          </div>

          <ul className="mt-5 space-y-4">
            {contactDetails.map((item) => {
              const Icon = contactIcons[item.type];
              const href = item.type === 'email' ? `mailto:${item.value}` : item.type === 'phone' ? `tel:${item.value.replace(/\s/g, '')}` : undefined;

              return (
                <li key={item.label} className="flex items-start gap-3 rounded-xl border border-white/10 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/15">
                    <Icon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block text-sm text-ink-300 transition-colors hover:text-white">{item.value}</a>
                    ) : (
                      <p className="mt-1 text-sm text-ink-300">{item.value}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-7">
            <p className="text-sm font-medium text-white">Follow us</p>
            <div className="mt-3 flex gap-3">
              {socialLinks.map((item) => {
                const Icon = socialIcons[item.type];
                return (
                  <a key={item.label} href={item.href} aria-label={item.label} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-ink-300 transition-colors hover:bg-brand-600 hover:text-white">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink-900">Send us a message</h2>
          <p className="mt-2 text-sm text-ink-500">Fields marked with an asterisk are required.</p>
          <form className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700">Full Name *</label>
                <input type="text" className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700">Email Address *</label>
                <input type="email" className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Phone Number <span className="font-normal text-ink-500">(optional)</span></label>
              <input type="tel" className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Subject *</label>
              <input type="text" className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Message *</label>
              <textarea rows={5} className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500" required />
            </div>
            <button type="submit" className="inline-flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 sm:w-auto">Send Message</button>
          </form>
          <p className="mt-5 text-sm text-ink-500">We typically respond to inquiries within 24–48 business hours.</p>
        </section>
      </div>
    </div>
  );
}
