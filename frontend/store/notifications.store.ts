import { create } from 'zustand';
import type { NotificationItem } from '@/types';
import { notificationsService } from '@/lib/services/notifications.service';

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const items = await notificationsService.myNotifications();
      set({ items, unreadCount: items.filter((i) => !i.read).length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await notificationsService.markRead(id);
    const items = get().items.map((i) => (i.id === id ? { ...i, read: true } : i));
    set({ items, unreadCount: items.filter((i) => !i.read).length });
  },

  markAllRead: async () => {
    await notificationsService.markAllRead();
    const items = get().items.map((i) => ({ ...i, read: true }));
    set({ items, unreadCount: 0 });
  },
}));
