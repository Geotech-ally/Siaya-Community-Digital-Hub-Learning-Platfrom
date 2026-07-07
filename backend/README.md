# Siaya Community Digital Hub Learning Platform — Backend API

A production-ready, modular NestJS backend for the **Siaya Community Digital Hub Learning Platform**, a Community Learning Management System (LMS) supporting course delivery, fully online quizzes, and learner progress tracking.

## Architecture

```
Core API Layer        -> auth, users, courses, lessons, enrollments, quizzes,
                          assignments, progress, certificates, analytics, audit
Integration Layer      -> integrations (email/SMTP), ai (placeholder), notifications
Data Layer              -> PostgreSQL via Prisma ORM
Infrastructure Layer    -> Redis (cache), BullMQ (background jobs), file storage abstraction
```

## Tech Stack

- NestJS (TypeScript)
- PostgreSQL + Prisma ORM
- JWT auth (access + refresh tokens), bcrypt password hashing
- RBAC via `@Roles()` decorator + Guards
- Redis caching, BullMQ background jobs (email notifications, report generation)
- class-validator DTO validation

## Roles (strict)

| Role     | Created by            | Key capabilities |
|----------|------------------------|-------------------|
| ADMIN    | Seeded / existing Admin | Full control: creates Trainers, manages all users, courses, trainer assignment, certificates, audit logs, analytics |
| TRAINER  | **Admin only** — cannot self-register | Creates/manages assigned courses, lessons (no PDFs, video links only), quizzes, assignments, grades learners, monitors progress |
| LEARNER  | Self-registration allowed | Enrolls in courses, consumes full content, attempts online quizzes, submits assignments, tracks own progress per course, downloads certificates |

## Getting Started

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

Default seeded accounts (see `prisma/seed.ts`):
- Admin: `admin@sicodihub.ac.ke` / value of `SEED_ADMIN_PASSWORD`
- Trainer: `trainer@sicodihub.ac.ke` / `Trainer123!`
- Learner: `learner@sicodihub.ac.ke` / `Learner123!`

### Docker

```bash
docker compose up --build
```

## API Overview (prefix `/api/v1`)

- `POST /auth/register` — learner self-registration
- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `POST /users/trainers` — **Admin only**, create a Trainer
- `GET /users`, `PATCH /users/:id/status` — Admin user management
- `POST /courses`, `PATCH /courses/:id`, `POST /courses/:id/trainers` — course + trainer assignment (Admin assigns trainers)
- `POST /modules`, `POST /lessons`, `GET /courses/:courseId/content` — structured lesson content (no PDFs)
- `POST /enrollments`, `GET /enrollments/me` — learner enrollment
- `POST /quizzes`, `POST /quizzes/:id/submit` — fully online quizzes with auto-grading
- `POST /assignments`, `POST /assignments/:id/submit`, `POST /assignments/submissions/:id/grade`
- `POST /progress/complete-lesson`, `GET /progress/me/course/:courseId` — per-course learner progress
- `GET /certificates/me`, `POST /certificates/issue/...` — certificate download/issuance
- `GET /notifications/me`, `POST /notifications/course/:courseId/broadcast`
- `GET /analytics/weekly-report`, `/course-completion-rates`, `/learner-engagement`, `/user-activity/:userId` — for external analytics systems (Admin only, no dashboard)
- `GET /audit-logs` — Admin-only audit trail

## Notes

- This platform intentionally excludes SaaS billing, freelancing marketplaces, and PDF-based content delivery, per project scope.
- All protected routes are guarded globally by `JwtAuthGuard` + `RolesGuard`; mark public routes with `@Public()`.
