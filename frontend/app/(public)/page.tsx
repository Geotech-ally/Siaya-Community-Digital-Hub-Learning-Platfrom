import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/lib/brand';
import { BookOpen, CheckCircle2, Users, Award, ArrowRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const highlights = [
  'Quizzes & assignments built in',
  'Certificates on completion',
  'Mentor-led guidance',
  'Community-powered learning',
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-ink-900/8 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.15),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.15),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 sm:h-16 sm:w-16">
              <GraduationCap className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              {PLATFORM_NAME}
            </h1>
            <p className="mt-4 text-lg text-ink-500 sm:text-xl">{PLATFORM_TAGLINE}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Enroll Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border border-ink-900/10 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-subtle"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
            <BookOpen className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-display text-base font-semibold text-ink-900">Diverse Courses</h3>
            <p className="mt-1 text-sm text-ink-500">ICT, design, marketing, data & AI, and more.</p>
          </div>
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
            <CheckCircle2 className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-display text-base font-semibold text-ink-900">Verified Skills</h3>
            <p className="mt-1 text-sm text-ink-500">Quizzes, assignments, and certificates for every course.</p>
          </div>
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
            <Users className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-display text-base font-semibold text-ink-900">Expert Mentors</h3>
            <p className="mt-1 text-sm text-ink-500">Trainers from industry and academia guide your journey.</p>
          </div>
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
            <Award className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-display text-base font-semibold text-ink-900">Career Growth</h3>
            <p className="mt-1 text-sm text-ink-500">Build practical skills employers actively look for.</p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-ink-900/8 bg-white p-8 shadow-card">
          <h2 className="font-display text-2xl font-bold text-ink-900">Everything you need to learn and grow</h2>
          <p className="mt-3 text-ink-500">
            From foundational ICT skills to advanced data & AI courses — track progress, submit assignments, pass quizzes, and earn certificates.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink-700">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              Enroll Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
