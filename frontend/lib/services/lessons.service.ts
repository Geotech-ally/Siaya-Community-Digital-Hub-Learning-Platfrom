import api from '@/lib/api';
import type { Lesson } from '@/types';

interface ModuleShape {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export const lessonsService = {
  listByCourse: (courseId: string) =>
    api.get<ModuleShape[]>(`/courses/${courseId}/lessons`).then((r) => {
      // Backend returns modules (each with nested lessons); flatten into a
      // single ordered lesson list so the UI can render and navigate them.
      return r.data
        .flatMap((m) => (m.lessons ?? []).map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title })))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }),

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
