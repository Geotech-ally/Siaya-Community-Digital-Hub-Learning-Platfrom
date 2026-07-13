import api, { API_ORIGIN } from '@/lib/api';
import { tokenStorage } from '@/lib/auth';
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

export interface DashboardSummaryPayload {
  platform: PlatformAnalytics | null;
  trainer: TrainerAnalytics | null;
}

export const analyticsService = {
  dashboardSummary: async (): Promise<DashboardSummaryPayload> => {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${API_ORIGIN}/api/v1/dashboard`, {
      cache: 'force-cache',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      throw new Error('Failed to load dashboard summary');
    }

    return response.json() as Promise<DashboardSummaryPayload>;
  },

  platform: () => api.get<PlatformAnalytics>('/analytics/platform').then((r) => r.data),

  trainer: () => api.get<TrainerAnalytics>('/analytics/trainer').then((r) => r.data),

  auditLogs: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', { params }).then((r) => r.data),
};
