import api from '@/lib/api';
import type { UserSettings } from '@/types';

export interface SettingsUpdate {
  emailNotifications?: boolean;
  messageNotifications?: boolean;
  courseAnnouncements?: boolean;
  publicProfile?: boolean;
  shareCertificates?: boolean;
  theme?: string;
  language?: string;
}

export const settingsService = {
  getMine: () => api.get<UserSettings>('/settings/me').then((r) => r.data),

  update: (data: SettingsUpdate) =>
    api.patch<UserSettings>('/settings/me', data).then((r) => r.data),
};
