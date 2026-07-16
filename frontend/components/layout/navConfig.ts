import type { Role } from '@/types';
import {
  LayoutDashboard, Users, BookOpen, Layers, ClipboardList,
  Megaphone, BarChart3, ScrollText, Award, Settings,
  Video, FileEdit, HelpCircle, CheckSquare, LineChart,
  MessageSquare, Sparkles, GraduationCap, Bell,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Feature is planned but not yet implemented — rendered disabled with a "Soon" badge. */
  comingSoon?: boolean;
}

export const navByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: BookOpen },
    { label: 'Departments', href: '/dashboard/admin/departments', icon: Layers },
    { label: 'Enrollments', href: '/dashboard/admin/enrollments', icon: ClipboardList },
    { label: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone },
    { label: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { label: 'Certificates', href: '/dashboard/admin/certificates', icon: Award },
    { label: 'Audit logs', href: '/dashboard/admin/audit-logs', icon: ScrollText },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
  ],
  TRAINER: [
    { label: 'Overview', href: '/dashboard/trainer', icon: LayoutDashboard },
    { label: 'My courses', href: '/dashboard/trainer/courses', icon: BookOpen },
    { label: 'Lessons', href: '/dashboard/trainer/lessons', icon: Video },
    { label: 'Quizzes', href: '/dashboard/trainer/quizzes', icon: HelpCircle },
    { label: 'Assignments', href: '/dashboard/trainer/assignments', icon: FileEdit },
    { label: 'Grading', href: '/dashboard/trainer/grading', icon: CheckSquare },
    { label: 'Learner progress', href: '/dashboard/trainer/progress', icon: LineChart },
    { label: 'Messages', href: '/dashboard/trainer/messages', icon: MessageSquare, comingSoon: true },
    { label: 'AI assistant', href: '/dashboard/trainer/ai-assistant', icon: Sparkles, comingSoon: true },
  ],
  LEARNER: [
    { label: 'Overview', href: '/dashboard/learner', icon: LayoutDashboard },
    { label: 'Browse courses', href: '/dashboard/learner/courses', icon: BookOpen },
    { label: 'My progress', href: '/dashboard/learner/progress', icon: GraduationCap },
    { label: 'Notifications', href: '/dashboard/learner/notifications', icon: Bell },
    { label: 'Certificates', href: '/dashboard/learner/certificates', icon: Award },
    { label: 'AI assistant', href: '/dashboard/learner/ai-assistant', icon: Sparkles, comingSoon: true },
  ],
};

export const roleLabel: Record<Role, string> = {
  ADMIN: 'Administrator',
  TRAINER: 'Trainer',
  LEARNER: 'Learner',
};
