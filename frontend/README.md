# Community LMS — Frontend

Production-ready Next.js (App Router) frontend for a role-based Learning
Management System, built to integrate with a NestJS backend.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (auth + notifications state)
- Axios (with automatic access/refresh token handling)
- React Hook Form + Zod
- Recharts
- next-pwa (installable, offline-capable)

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your NestJS API
npm run dev
```

## Project structure

```
app/
  (auth)/login, (auth)/register        Public auth screens
  (dashboard)/admin/...                Admin-only screens (RBAC-protected)
  (dashboard)/trainer/...              Trainer-only screens
  (dashboard)/learner/...              Learner-only screens
  courses/[courseId]/...               Course detail + lesson player
  quizzes/[quizId]                     Quiz-taking interface
  assignments/[assignmentId]           Assignment submission
  certificates|notifications|analytics Role-aware redirects into the dashboard
lib/
  api.ts                               Axios instance, token refresh interceptor
  auth.ts                              Token storage + JWT decoding helpers
  services/*.ts                        One module per backend resource
store/
  auth.store.ts                        Zustand auth store (persisted)
  notifications.store.ts               Zustand notifications store
components/
  ui/          Reusable primitives (Button, Input, Table, Modal, ...)
  layout/      Sidebar, Topbar, DashboardShell, AI assistant panel
  forms/       Zod schemas shared by all forms
common/
  hooks/       useRequireAuth, useDebounce
  utils/       cn(), date/number formatting
middleware.ts  Server-side RBAC route protection (reads JWT from cookie)
```

## Auth & RBAC

- On login/register, the API returns `accessToken` + `refreshToken`. Both are
  stored in `localStorage`, and the access token is mirrored into a
  `lms_access_token` cookie so `middleware.ts` can enforce role-based routing
  on the server before a page ever renders.
- Axios automatically retries a request once with a refreshed token on a 401,
  queuing concurrent requests while the refresh is in flight.
- `useRequireAuth(['ADMIN'])` in each dashboard layout is a client-side
  backstop in case middleware state and client state briefly disagree.

## Departments & roles (fixed, per spec)

Departments: Basic ICT Skills · Design Courses · Marketing Courses ·
Computer Science · Data Science and AI.

Roles: ADMIN, TRAINER, LEARNER — each with its own dashboard at
`/dashboard/{role}`.

## Backend contract

All API calls assume REST endpoints under `NEXT_PUBLIC_API_URL` matching the
shapes in `types/index.ts` and `lib/services/*.ts` (e.g. `POST /auth/login`,
`GET /courses`, `POST /courses/:id/enroll`, `POST /quizzes/:id/attempts`,
`PATCH /submissions/:id/grade`). Adjust service files if your NestJS route
names differ.

## PWA

`next-pwa` is configured in `next.config.js` with runtime caching for API
GETs, images, and video. `public/manifest.json` and `public/icons/*` are
included; the service worker is only registered in production builds.
