import { jwtDecode } from 'jwt-decode';
import type { Role } from '@/types';

const ACCESS_TOKEN_KEY = 'lms_access_token';
const REFRESH_TOKEN_KEY = 'lms_refresh_token';

interface DecodedToken {
  sub: string;
  email: string;
  role: Role;
  exp: number;
}

// Token storage is centralized here so we can swap between localStorage and
// httpOnly-cookie-backed storage later without touching call sites.
export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    // Mirrored into a short-lived cookie so middleware.ts (server-side)
    // can read role/auth state for route protection.
    document.cookie = `lms_access_token=${accessToken}; path=/; max-age=${
      60 * 60 * 24
    }; SameSite=Lax`;
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = 'lms_access_token=; path=/; max-age=0';
  },
};

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

export function getRoleFromToken(token: string): Role | null {
  return decodeToken(token)?.role ?? null;
}

export const roleDashboardPath: Record<Role, string> = {
  ADMIN: '/dashboard/admin',
  TRAINER: '/dashboard/trainer',
  LEARNER: '/dashboard/learner',
};
