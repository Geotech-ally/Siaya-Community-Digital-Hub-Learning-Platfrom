import {
  Laptop,
  PenTool,
  Megaphone,
  Code2,
  Database,
  type LucideIcon,
} from 'lucide-react';
import type { Department } from '@/types';

export type DepartmentCategory = {
  department: Department;
  title: string;
  icon: LucideIcon;
  courses: string[];
};

export const departmentCategories: DepartmentCategory[] = [
  {
    department: 'BASIC_ICT_SKILLS',
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
    department: 'DESIGN_COURSES',
    title: 'Design Courses',
    icon: PenTool,
    courses: ['UX/UI Design', 'Graphic Design Course – Adobe Certified', 'Introduction to Graphic Design'],
  },
  {
    department: 'MARKETING_COURSES',
    title: 'Marketing Courses',
    icon: Megaphone,
    courses: ['Introduction to Social Media Training', 'Advanced Digital Marketing – Meta Certified'],
  },
  {
    department: 'COMPUTER_SCIENCE',
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
    department: 'DATA_SCIENCE_AND_AI',
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

export const departments = departmentCategories.map((category) => category.title);

export function normalizeCourseTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}
