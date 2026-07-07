import api from '@/lib/api';
import type { Course, Department, PaginatedResponse } from '@/types';

export const coursesService = {
  list: (params?: { department?: Department; search?: string; page?: number; pageSize?: number }) =>
    api.get<PaginatedResponse<Course>>('/courses', { params }).then((r) => r.data),

  get: (id: string) => api.get<Course>(`/courses/${id}`).then((r) => r.data),

  create: (payload: Partial<Course>) => api.post<Course>('/courses', payload).then((r) => r.data),

  update: (id: string, payload: Partial<Course>) =>
    api.patch<Course>(`/courses/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/courses/${id}`).then((r) => r.data),

  assignTrainer: (id: string, trainerId: string) =>
    api.patch<Course>(`/courses/${id}/assign-trainer`, { trainerId }).then((r) => r.data),

  publish: (id: string, isPublished: boolean) =>
    api.patch<Course>(`/courses/${id}/publish`, { isPublished }).then((r) => r.data),
};
