import { PLATFORM_NAME } from '@/lib/brand';
import { Mail, MapPin, Phone } from 'lucide-react';

const contacts = [
  {
    title: 'Email',
    detail: 'info@sia-dhub.org',
    icon: Mail,
  },
  {
    title: 'Phone',
    detail: '+254 711 223 344',
    icon: Phone,
  },
  {
    title: 'Location',
    detail: 'Siaya, Kenya',
    icon: MapPin,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          Have a question or need support? Reach out to the {PLATFORM_NAME} team and we&rsquo;ll get back to you as soon as possible.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {contacts.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 rounded-xl border border-ink-900/8 p-5 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <item.icon className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink-700">Full Name</label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Email Address</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Subject</label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700">Message</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-lg border border-ink-900/10 bg-surface px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-500"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 sm:w-auto"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
