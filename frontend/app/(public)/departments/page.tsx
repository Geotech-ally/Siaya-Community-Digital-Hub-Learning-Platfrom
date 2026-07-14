import { PLATFORM_NAME } from '@/lib/brand';
import {
  Laptop,
  PenTool,
  Megaphone,
  Code2,
  Database,
  type LucideIcon,
} from 'lucide-react';

type DepartmentCategory = {
  title: string;
  icon: LucideIcon;
  courses: string[];
};

const categories: DepartmentCategory[] = [
  {
    title: 'Basic ICT Skills',
    icon: Laptop,
    courses: [
      'ICT and Society',
      'Productivity Tools',
      'Internet and Web Technologies',
      'Networks and CCTV',
      'Programming – Web Development',
      'Phone Repair',
      'Graphics and Animation',
      'Video Production & Editing',
      'Computer Repair and Maintenance',
    ],
  },
  {
    title: 'Design Courses',
    icon: PenTool,
    courses: ['UX/UI Design', 'Graphic Design Course – Adobe Certified', 'Introduction to Graphic Design'],
  },
  {
    title: 'Marketing Courses',
    icon: Megaphone,
    courses: ['Introduction to Social Media Training', 'Advanced Digital Marketing – Meta Certified'],
  },
  {
    title: 'Computer Science Courses',
    icon: Code2,
    courses: [
      'Software Development – Full Stack',
      'Introduction to Web Programming',
      'Front-End Developer Course – React JS',
      'ISTQB Software Testing Certification',
      'Cybersecurity Course – CompTIA Security+ Certified',
      'Introduction to Microsoft Office Course',
      'Introduction to Game Development',
    ],
  },
  {
    title: 'Data Science and AI Courses',
    icon: Database,
    courses: [
      'Introduction to Python Programming',
      'Data Scientist Course',
      'Data Analyst Course – Microsoft Power BI Certified',
      'Generative AI Course',
      'Introduction to Artificial Intelligence',
    ],
  },
];

export const metadata = {
  title: `Departments — ${PLATFORM_NAME}`,
  description: 'Explore our departments and the courses available across ICT, design, marketing, computer science, and data & AI.',
};

export default function DepartmentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Departments</h1>
        <p className="mt-4 text-lg text-ink-500">
          Browse our departments and discover the courses designed to build practical, job-ready digital skills.
        </p>
      </div>

      <div className="mt-16 space-y-12">
        {categories.map((category) => (
          <section
            key={category.title}
            className="rounded-2xl border border-ink-900/8 bg-white p-6 shadow-card sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <category.icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">{category.title}</h2>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.courses.map((course) => (
                <li
                  key={course}
                  className="rounded-xl border border-ink-900/8 bg-surface-subtle px-4 py-3 text-sm font-medium text-ink-700"
                >
                  {course}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
