import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Users,
  UserPlus,
  Layers,
  PlayCircle,
  GraduationCap,
  LogIn,
} from 'lucide-react';
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/lib/brand';
import { DEPARTMENT_LABELS, type Department } from '@/types';

export const revalidate = 300;

type PublicHomeData = {
  stats: {
    totalCourses: number;
    totalLearners: number;
    totalDepartments: number;
  };
  departments: { department: Department; courseCount: number }[];
  featuredCourses: {
    id: string;
    title: string;
    slug: string;
    description: string;
    department: Department;
    enrolledCount: number;
    moduleCount: number;
  }[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const highlights = [
  'Quizzes and assignments built in',
  'Certificates on completion',
  'Mentor-led practical learning',
  'Community-powered digital skills',
];

const processSteps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Register with your first name, last name, email address, and phone number.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Choose a Department',
    description: 'Browse all departments and pick the track that fits your goals.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'Learn at Your Pace',
    description: 'Watch videos, read modules, complete quizzes and assignments.',
    icon: PlayCircle,
  },
  {
    step: '04',
    title: 'Earn Your Certificate',
    description: 'Pass the final assessment and receive your official Hub certificate.',
    icon: GraduationCap,
  },
];

const fallbackData: PublicHomeData = {
  stats: { totalCourses: 0, totalLearners: 0, totalDepartments: 7 },
  departments: [],
  featuredCourses: [],
};

async function getHomeData(): Promise<PublicHomeData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/home`, {
      cache: 'force-cache',
      next: { revalidate },
    });

    if (!response.ok) return fallbackData;
    return response.json();
  } catch {
    return fallbackData;
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  const stats = [
    { label: 'Published courses', value: data.stats.totalCourses || 'Growing', icon: BookOpen },
    { label: 'Active learners', value: data.stats.totalLearners || 'Open', icon: Users },
    { label: 'Departments', value: data.stats.totalDepartments, icon: Sparkles },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b border-ink-900/8 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.15),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.15),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
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
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-ink-900/10 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-subtle"
              >
                <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign In
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border border-ink-900/10 bg-white px-6 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-subtle"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-ink-900/8 bg-white/80 p-5 text-center shadow-card backdrop-blur">
                  <Icon className="mx-auto h-5 w-5 text-brand-600" aria-hidden="true" />
                  <p className="mt-2 font-display text-2xl font-bold text-ink-900">{item.value}</p>
                  <p className="text-sm text-ink-500">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Simple process</h2>
          <p className="mt-3 text-base text-ink-500">Start learning in minutes</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <Icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
                  </div>
                  <span className="font-display text-3xl font-bold text-brand-200">{item.step}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={BookOpen} title="Diverse Courses" description="ICT, design, marketing, data and AI, networking, CCTV, and more." />
          <Feature icon={CheckCircle2} title="Verified Skills" description="Quizzes, assignments, and certificates for practical career growth." />
          <Feature icon={Users} title="Expert Mentors" description="Trainers from industry and academia guide each learning pathway." />
          <Feature icon={Award} title="Career Growth" description="Build practical digital skills employers and clients actively need." />
        </div>

        {data.featuredCourses.length > 0 && (
          <div className="mt-16">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink-900">Featured courses</h2>
                <p className="mt-2 text-sm text-ink-500">Cached from one optimized backend endpoint.</p>
              </div>
              <Link href="/register" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Enroll to access courses →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.featuredCourses.map((course) => (
                <article key={course.id} className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    {DEPARTMENT_LABELS[course.department] ?? course.department}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">{course.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-500">{course.description}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-ink-500">
                    <span>{course.moduleCount} modules</span>
                    <span>{course.enrolledCount} enrollments</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 rounded-2xl border border-ink-900/8 bg-white p-8 shadow-card">
          <h2 className="font-display text-2xl font-bold text-ink-900">Everything you need to learn and grow</h2>
          <p className="mt-3 text-ink-500">
            From foundational ICT skills to advanced data and AI courses — track progress, submit assignments, pass quizzes, and earn certificates.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink-700">
                <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
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
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card">
      <Icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
      <h3 className="mt-3 font-display text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{description}</p>
    </div>
  );
}
