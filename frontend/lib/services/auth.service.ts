import api from '@/lib/api';
import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@/types';

// The API is inconsistent about the user shape: /auth/login and /auth/register
// return `fullName`, while /users/me returns `firstName`/`lastName`. Normalize
// here so the rest of the app can always rely on `user.fullName` (otherwise the
// name shows after login but goes blank on refresh, when hydrate() reloads /me).
type RawUser = Partial<User> & {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email: string;
};

function normalizeUser(raw: RawUser): User {
  const composed = [raw.firstName, raw.lastName].filter(Boolean).join(' ').trim();
  const fullName = (raw.fullName ?? '').trim() || composed || raw.email;
  return { ...(raw as User), fullName };
}

export const authService = {
  login: (payload: LoginPayload) =>
    api
      .post<AuthTokens & { user: RawUser }>('/auth/login', payload)
      .then((r) => ({ ...r.data, user: normalizeUser(r.data.user) })),

  register: (payload: RegisterPayload) =>
    api
      .post<AuthTokens & { user: RawUser }>('/auth/register', payload)
      .then((r) => ({ ...r.data, user: normalizeUser(r.data.user) })),

  me: () => api.get<RawUser>('/users/me').then((r) => normalizeUser(r.data)),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }).then((r) => r.data),
};
