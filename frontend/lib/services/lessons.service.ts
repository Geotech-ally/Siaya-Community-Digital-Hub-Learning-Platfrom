import api from '@/lib/api';
import type { Lesson } from '@/types';

export const lessonsService = {
  listByCourse: (courseId: string) =>
    api.get<Lesson[]>(`/courses/${courseId}/lessons`).then((r) => r.data),

  get: (courseId: string, lessonId: string) =>
    api.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data),

  create: (courseId: string, payload: Partial<Lesson>) =>
    api.post<Lesson>(`/courses/${courseId}/lessons`, payload).then((r) => r.data),

  update: (courseId: string, lessonId: string, payload: Partial<Lesson>) =>
    api.patch<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, payload).then((r) => r.data),

  remove: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data),

  markComplete: (courseId: string, lessonId: string) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`).then((r) => r.data),
};
