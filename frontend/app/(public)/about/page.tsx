import { PLATFORM_NAME } from '@/lib/brand';
import { GraduationCap, Users, BookOpen, Award } from 'lucide-react';

const features = [
  {
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals across ICT, design, marketing, and technology.',
    icon: BookOpen,
  },
  {
    title: 'Hands-On Projects',
    description: 'Apply your skills through real-world assignments and practical exercises.',
    icon: Users,
  },
  {
    title: 'Certificates & Credit',
    description: 'Earn recognized certificates to showcase your achievements.',
    icon: Award,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          About {PLATFORM_NAME}
        </h1>
        <p className="mt-4 text-lg text-ink-500">
          A community-driven learning platform built to bridge the digital skills gap in Siaya and beyond. We empower learners with practical, job-ready training in ICT, design, marketing, data & AI, and more.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <feature.icon className="h-6 w-6 text-brand-600" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-ink-500">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-ink-900/8 bg-white p-8 shadow-card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50">
            <GraduationCap className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900">Our Mission</h3>
            <p className="mt-2 text-sm text-ink-500">
              Democratize access to quality digital education. Through partnerships with leading institutions and community-centered instruction, we help learners build skills that translate directly into career growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
