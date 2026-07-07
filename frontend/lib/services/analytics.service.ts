import api from '@/lib/api';
import type { AuditLogEntry, PaginatedResponse } from '@/types';

export interface PlatformAnalytics {
  totalUsers: number;
  totalTrainers: number;
  totalLearners: number;
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  enrollmentsByDepartment: { department: string; count: number }[];
  enrollmentsOverTime: { date: string; count: number }[];
}

export interface TrainerAnalytics {
  totalCourses: number;
  totalLearners: number;
  averageCompletionRate: number;
  averageQuizScore: number;
  courseBreakdown: { courseId: string; courseTitle: string; learners: number; completionRate: number }[];
}

export const analyticsService = {
  platform: () => api.get<PlatformAnalytics>('/analytics/platform').then((r) => r.data),

  trainer: () => api.get<TrainerAnalytics>('/analytics/trainer').then((r) => r.data),

  auditLogs: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', { params }).then((r) => r.data),
};
