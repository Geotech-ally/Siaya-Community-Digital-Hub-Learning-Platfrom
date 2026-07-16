import { PLATFORM_NAME } from '@/lib/brand';
import { Target, Eye, HeartHandshake, GraduationCap, Users, BookOpen, Award } from 'lucide-react';

const values = [
  {
    title: 'Integrity',
    description:
      'We ensure transparency and honesty in all our operations to build trust with our community.',
    icon: HeartHandshake,
  },
  {
    title: 'Innovation',
    description:
      'We continuously explore new ideas and solutions to meet the changing needs of the digital world.',
    icon: GraduationCap,
  },
  {
    title: 'Collaboration',
    description:
      'We foster a supportive environment where individuals share knowledge, skills, and resources to create opportunities for growth and success.',
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
          About {PLATFORM_NAME}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-700 dark:text-slate-300">
          Welcome to the Siaya Community Digital Hub Learning Platform, a transformative initiative dedicated to
          bridging the digital divide and empowering the people of Siaya, Kenya. Our mission is to create
          opportunities for growth by providing access to high-speed internet, digital skills training, and
          collaborative spaces designed to foster innovation, entrepreneurship, and business growth.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-ink-700 dark:text-slate-300">
          As a key enabler of the 4th Industrial Revolution in Siaya, we are committed to preparing the community for
          the evolving digital economy. By offering state-of-the-art facilities and expert-led training programs, we
          aim to equip individuals, businesses, and organizations with the tools they need to thrive in a rapidly
          changing world.
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-ink-900/8 bg-white dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur p-8 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-iris-500/15">
            <Target className="h-6 w-6 text-brand-600 dark:text-iris-300" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Our Mission</h2>
          <p className="text-sm leading-relaxed text-ink-500 dark:text-slate-400">
            Our Mission is to create job opportunities, spur innovation, equip the local communities with digital
            skills and take local businesses to the global arena.
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-ink-900/8 bg-white dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur p-8 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-iris-500/15">
            <Eye className="h-6 w-6 text-brand-600 dark:text-iris-300" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Our Vision</h2>
          <p className="text-sm leading-relaxed text-ink-500 dark:text-slate-400">
            A transformative initiative dedicated to bridging the digital divide in Siaya County and empowering local
            community members to fully participate in, and benefit from the digital economy.
          </p>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-ink-900/8 bg-white dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur p-8 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-iris-500/15">
            <HeartHandshake className="h-6 w-6 text-brand-600 dark:text-iris-300" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white">Core Values</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-slate-400">
              We are committed to integrity, ensuring transparency and honesty in all our operations to build trust
              with our community. We embrace innovation, continuously exploring new ideas and solutions to meet the
              changing needs of the digital world. Collaboration is at the heart of our work; we foster a supportive
              environment where individuals can share knowledge, skills, and resources to create opportunities for
              growth and success.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="rounded-2xl border border-ink-900/8 bg-white dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur p-6 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-iris-500/15">
              <value.icon className="h-6 w-6 text-brand-600 dark:text-iris-300" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-white">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-slate-400">{value.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
