import api from '@/lib/api';
import type { Assignment, AssignmentSubmission, PaginatedResponse } from '@/types';

export const assignmentsService = {
  listByCourse: (courseId: string) =>
    api.get<Assignment[]>(`/courses/${courseId}/assignments`).then((r) => r.data),

  get: (assignmentId: string) =>
    api.get<Assignment>(`/assignments/${assignmentId}`).then((r) => r.data),

  create: (courseId: string, payload: Partial<Assignment>) =>
    api.post<Assignment>(`/courses/${courseId}/assignments`, payload).then((r) => r.data),

  update: (assignmentId: string, payload: Partial<Assignment>) =>
    api.patch<Assignment>(`/assignments/${assignmentId}`, payload).then((r) => r.data),

  remove: (assignmentId: string) =>
    api.delete(`/assignments/${assignmentId}`).then((r) => r.data),

  submit: (assignmentId: string, payload: { textResponse?: string; fileUrl?: string }) =>
    api
      .post<AssignmentSubmission>(`/assignments/${assignmentId}/submissions`, payload)
      .then((r) => r.data),

  listSubmissions: (assignmentId: string, params?: { page?: number; pageSize?: number }) =>
    api
      .get<PaginatedResponse<AssignmentSubmission>>(
        `/assignments/${assignmentId}/submissions`,
        { params }
      )
      .then((r) => r.data),

  grade: (submissionId: string, payload: { grade: number; feedback?: string }) =>
    api
      .patch<AssignmentSubmission>(`/submissions/${submissionId}/grade`, payload)
      .then((r) => r.data),
};
