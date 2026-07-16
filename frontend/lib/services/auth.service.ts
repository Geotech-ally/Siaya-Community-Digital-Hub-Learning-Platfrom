import api, { API_ORIGIN } from '@/lib/api';
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokens & { user: User }>('/auth/login', payload).then((r) => r.data),

    register: (payload: RegisterPayload) =>
    api.post<AuthTokens & { user: User }>('/auth/register', payload).then((r) => r.data),

  me: () => api.get<User>('/users/me').then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),
};
