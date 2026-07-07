import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import type { Role } from '@/types';

// Route protection map: which roles may access which dashboard prefix.
const ROLE_PREFIXES: Record<string, Role> = {
  '/dashboard/admin': 'ADMIN',
  '/dashboard/trainer': 'TRAINER',
  '/dashboard/learner': 'LEARNER',
};

const PUBLIC_PATHS = ['/login', '/register'];

interface DecodedToken {
  sub: string;
  role: Role;
  exp: number;
}

function getRoleFromRequest(req: NextRequest): Role | null {
  const token = req.cookies.get('lms_access_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded.role;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = getRoleFromRequest(req);

  // Redirect already-authenticated users away from auth pages.
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) && role) {
    return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
  }

  // Protect dashboard routes by role.
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) => pathname.startsWith(prefix));
  if (matchedPrefix) {
    if (!role) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== ROLE_PREFIXES[matchedPrefix]) {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
