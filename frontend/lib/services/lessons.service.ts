import api from '@/lib/api';
import type { CourseModule, Lesson } from '@/types';

export const lessonsService = {
  listModulesByCourse: (courseId: string) =>
    api.get<CourseModule[]>(`/courses/${courseId}/lessons`).then((r) =>
      r.data
        .map((module) => ({
          ...module,
          lessons: (module.lessons ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    ),

  listByCourse: (courseId: string) =>
    api.get<CourseModule[]>(`/courses/${courseId}/lessons`).then((r) => {
      // Backend returns modules (each with nested lessons); flatten into a
      // single ordered lesson list so the UI can render and navigate them.
      return r.data
        .flatMap((m) => (m.lessons ?? []).map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }),

  get: (courseId: string, lessonId: string) =>
    api.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data),

  createModule: (payload: { title: string; courseId: string; order?: number }) =>
    api.post('/modules', payload).then((r) => r.data),

  create: (courseId: string, payload: Partial<Lesson> & { moduleId?: string }) =>
    api.post<Lesson>(`/courses/${courseId}/lessons`, payload).then((r) => r.data),

  update: (courseId: string, lessonId: string, payload: Partial<Lesson>) =>
    api.patch<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, payload).then((r) => r.data),

  remove: (courseId: string, lessonId: string) =>
    api.delete(`/courses/${courseId}/lessons/${lessonId}`).then((r) => r.data),

  markComplete: (courseId: string, lessonId: string) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`).then((r) => r.data),
};
