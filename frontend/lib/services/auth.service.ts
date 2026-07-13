import axios from 'axios';
import api, { API_ORIGIN } from '@/lib/api';
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokens & { user: User }>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    axios
      .post<AuthTokens & { user: User }>(`${API_ORIGIN}/api/v1/auth/register`, payload)
      .then((r) => r.data),

  me: () => api.get<User>('/users/me').then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),
};
