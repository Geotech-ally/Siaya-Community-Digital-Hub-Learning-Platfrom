import api from '@/lib/api';
import type { Announcement, NotificationItem, PaginatedResponse } from '@/types';

export const notificationsService = {
  myNotifications: () => api.get<NotificationItem[]>('/notifications/me').then((r) => r.data),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),

  listAnnouncements: (params?: { courseId?: string; page?: number; pageSize?: number }) =>
    api
      .get<PaginatedResponse<Announcement>>('/notifications/announcements', { params })
      .then((r) => r.data),

  createAnnouncement: (payload: Partial<Announcement>) =>
    api.post<Announcement>('/notifications/announcements', payload).then((r) => r.data),

  removeAnnouncement: (id: string) =>
    api.delete(`/notifications/announcements/${id}`).then((r) => r.data),
};
