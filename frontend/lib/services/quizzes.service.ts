import api from '@/lib/api';
import type { Quiz, QuizAttempt } from '@/types';

export const quizzesService = {
  listByCourse: (courseId: string) =>
    api.get<Quiz[]>(`/courses/${courseId}/quizzes`).then((r) => r.data),

  get: (quizId: string) => api.get<Quiz>(`/quizzes/${quizId}`).then((r) => r.data),

  create: (courseId: string, payload: Partial<Quiz>) =>
    api.post<Quiz>(`/courses/${courseId}/quizzes`, payload).then((r) => r.data),

  update: (quizId: string, payload: Partial<Quiz>) =>
    api.patch<Quiz>(`/quizzes/${quizId}`, payload).then((r) => r.data),

  remove: (quizId: string) => api.delete(`/quizzes/${quizId}`).then((r) => r.data),

  submitAttempt: (quizId: string, answers: Record<string, string[]>) =>
    api.post<QuizAttempt>(`/quizzes/${quizId}/attempts`, { answers }).then((r) => r.data),

  myAttempts: (quizId: string) =>
    api.get<QuizAttempt[]>(`/quizzes/${quizId}/attempts/me`).then((r) => r.data),
};
