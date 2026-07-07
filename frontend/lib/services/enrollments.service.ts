import api from '@/lib/api';
import type { Enrollment, PaginatedResponse } from '@/types';

export const enrollmentsService = {
  listByCourse: (courseId: string, params?: { page?: number; pageSize?: number }) =>
    api
      .get<PaginatedResponse<Enrollment>>(`/enrollments/course/${courseId}`, { params })
      .then((r) => r.data),

  listMine: () => api.get<Enrollment[]>('/enrollments/me').then((r) => r.data),

  enroll: (courseId: string) =>
    api.post<Enrollment>(`/enrollments/courses/${courseId}/enroll`).then((r) => r.data),

  unenroll: (courseId: string) =>
    api.delete(`/enrollments/courses/${courseId}/enroll`).then((r) => r.data),

  all: (params?: { page?: number; pageSize?: number; status?: string }) =>
    api.get<PaginatedResponse<Enrollment>>('/enrollments', { params }).then((r) => r.data),
};
