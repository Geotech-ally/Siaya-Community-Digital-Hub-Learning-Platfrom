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
  LogIn,
} from 'lucide-react';
import { PLATFORM_SHORT_NAME, PLATFORM_TAGLINE } from '@/lib/brand';
import { DEPARTMENT_LABELS, type Department } from '@/types';
import { HeroBackdrop } from '@/components/layout/HeroBackdrop';

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
    title: 'Create Account or Sign In',
    description: 'Register a new learner account or sign in to continue where you left off.',
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
    title: 'Select a Course',
    description: 'Open a course to review modules, lessons, quizzes, and assignments.',
    icon: BookOpen,
  },
  {
    step: '04',
    title: 'Start Learning',
    description: 'Enroll, learn at your pace, and resume from your last progress point anytime.',
    icon: PlayCircle,
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
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-ink-900/5 bg-white dark:border-white/5 dark:bg-void-950">
        {/* subtle dark backdrop (light stays pure white) */}
        <div className="absolute inset-0 hidden bg-void-mesh dark:block" />
        {/* cursor-reactive confetti particle field */}
        <HeroBackdrop />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center sm:px-6 lg:px-8">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-900/10 bg-white/70 px-4 py-1.5 text-xs font-semibold text-ink-700 backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-iris-400" aria-hidden="true" />
              Siaya County · Free Digital Skills Hub
            </span>
            <h1 className="mx-auto mt-8 max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-ink-900 dark:text-white sm:text-7xl">
              Experience liftoff in your digital career
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-500 dark:text-slate-400">
              {PLATFORM_SHORT_NAME} — mentor-led courses in ICT, design, marketing, data and AI, with quizzes, assignments, and certificates. {PLATFORM_TAGLINE}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-ink-900"
              >
                Enroll Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-full border border-ink-900/15 bg-white/70 px-7 py-3.5 text-sm font-semibold text-ink-700 backdrop-blur transition-colors hover:border-ink-900/30 hover:text-ink-900 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/40 dark:hover:text-white"
              >
                <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign In
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
            {stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="card-hover rounded-2xl border border-ink-900/8 bg-white/80 p-6 text-center shadow-card backdrop-blur animate-fade-up dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
                  style={{ animationDelay: `${120 + i * 90}ms` }}
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient shadow-glow dark:bg-iris-gradient dark:shadow-glow-iris">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-bold text-ink-900 dark:text-white">{item.value}</p>
                  <p className="text-sm text-ink-500 dark:text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="bg-white dark:bg-void-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-iris-400">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              Start learning in four steps
            </h2>
            <p className="mt-3 text-base text-ink-500 dark:text-slate-400">From sign-up to certificate — a clear path the whole way.</p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="card-hover group relative overflow-hidden rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur"
                >
                  <span className="pointer-events-none absolute -right-3 -top-4 font-display text-7xl font-bold text-brand-50 transition-colors group-hover:text-brand-100 dark:text-white/5 dark:group-hover:text-iris-500/20">
                    {item.step}
                  </span>
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient shadow-glow dark:bg-iris-gradient dark:shadow-glow-iris">
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="relative mt-5 font-display text-lg font-semibold text-ink-900 dark:text-white">{item.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink-500 dark:text-slate-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES + COURSES + CTA ---------------- */}
      <section className="bg-white dark:bg-void-950">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={BookOpen} title="Diverse Courses" description="ICT, design, marketing, data and AI, networking, CCTV, and more." />
            <Feature icon={CheckCircle2} title="Verified Skills" description="Quizzes, assignments, and certificates for practical career growth." />
            <Feature icon={Users} title="Expert Mentors" description="Trainers from industry and academia guide each learning pathway." />
            <Feature icon={Award} title="Career Growth" description="Build practical digital skills employers and clients actively need." />
          </div>

          {data.featuredCourses.length > 0 && (
            <div className="mt-20">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-iris-400">Explore</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-ink-900 dark:text-white">Featured courses</h2>
                </div>
                <Link href="/register" className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-iris-400 dark:hover:text-iris-300">
                  Enroll to access courses
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.featuredCourses.map((course) => (
                  <article key={course.id} className="card-hover group flex flex-col rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur">
                    <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-iris-500/15 dark:text-iris-300">
                      {DEPARTMENT_LABELS[course.department] ?? course.department}
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-iris-300">{course.title}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-500 dark:text-slate-400">{course.description}</p>
                    <div className="mt-5 flex items-center gap-4 border-t border-ink-900/5 pt-4 text-xs font-medium text-ink-500 dark:border-white/10 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {course.moduleCount} modules</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrolledCount} enrolled</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="relative mt-20 overflow-hidden rounded-3xl bg-brand-gradient p-8 shadow-glow dark:bg-iris-gradient dark:shadow-glow-iris sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <h2 className="max-w-2xl font-display text-3xl font-bold text-white sm:text-4xl">Everything you need to learn and grow</h2>
              <p className="mt-3 max-w-2xl text-white/80">
                From foundational ICT skills to advanced data and AI courses — track progress, submit assignments, pass quizzes, and earn certificates.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-white">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-brand-700 shadow-sm transition-transform hover:-translate-y-0.5 dark:text-iris-700"
                >
                  Enroll Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
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
    <div className="card-hover group rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-gradient group-hover:text-white dark:bg-iris-500/15 dark:text-iris-300 dark:group-hover:bg-iris-gradient dark:group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
