import api from '@/lib/api';
import type { PaginatedResponse, Role, User } from '@/types';

export const usersService = {
  list: (params?: { role?: Role; search?: string; page?: number; pageSize?: number }) =>
    api.get<User[] | PaginatedResponse<User>>('/users', { params }).then((r) => {
      const body = r.data;
      if (Array.isArray(body)) {
        return { data: body, total: body.length, page: 1, pageSize: body.length };
      }
      return body;
    }),

  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),

  create: (payload: Partial<User> & { password: string }) =>
    api.post<User>('/users', payload).then((r) => r.data),

  update: (id: string, payload: Partial<User>) =>
    api.patch<User>(`/users/${id}`, payload).then((r) => r.data),

  deactivate: (id: string) => api.patch<User>(`/users/${id}/deactivate`).then((r) => r.data),

  activate: (id: string) => api.patch<User>(`/users/${id}/activate`).then((r) => r.data),

  remove: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),

  updateMe: (payload: { firstName?: string; lastName?: string; email?: string }) =>
    api.patch<User>('/users/me', payload).then((r) => r.data),
};
