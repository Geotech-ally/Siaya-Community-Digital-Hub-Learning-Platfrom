import Link from 'next/link';
import { PLATFORM_NAME } from '@/lib/brand';
import { departmentCategories, normalizeCourseTitle } from '@/constants/departments';
import { fetchPublicCourses } from '@/lib/services/public.service';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: `Departments — ${PLATFORM_NAME}`,
  description: 'Explore our departments and the courses available across ICT, design, marketing, computer science, and data & AI.',
};

function buildCourseLinkMap(courses: Awaited<ReturnType<typeof fetchPublicCourses>>) {
  const byTitle = new Map<string, string>();
  for (const course of courses) {
    byTitle.set(normalizeCourseTitle(course.title), course.id);
  }
  return byTitle;
}

export default async function DepartmentsPage() {
  const publishedCourses = await fetchPublicCourses();
  const courseLinks = buildCourseLinkMap(publishedCourses);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">Departments</h1>
        <p className="mt-4 text-lg text-ink-500 dark:text-slate-400">
          Browse our departments and discover the courses designed to build practical, job-ready digital skills.
        </p>
      </div>

      <div className="mt-16 space-y-12">
        {departmentCategories.map((category) => (
          <section
            key={category.title}
            className="rounded-2xl border border-ink-900/8 bg-white dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur p-6 shadow-card sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-iris-500/15">
                <category.icon className="h-6 w-6 text-brand-600 dark:text-iris-300" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-white sm:text-2xl">{category.title}</h2>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.courses.map((course) => {
                const courseId = courseLinks.get(normalizeCourseTitle(course));
                const href = courseId
                  ? `/courses/${courseId}`
                  : `/register?redirect=${encodeURIComponent('/dashboard/learner/courses')}`;

                return (
                  <li key={course}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between rounded-xl border border-ink-900/8 bg-surface-subtle px-4 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-iris-400/50 dark:hover:bg-iris-500/10 dark:hover:text-iris-300"
                    >
                      <span>{course}</span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 dark:text-slate-500 dark:group-hover:text-iris-300"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
