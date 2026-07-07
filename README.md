# Siaya Community Digital Hub Learning Platform

This repository contains a clean monorepo structure for the Siaya Community Digital Hub Learning Platform, with a dedicated backend API and frontend application.

## Repository Structure

- `backend/` — NestJS backend API and Prisma database layer.
- `frontend/` — Next.js frontend application.

## Getting Started

### Backend

1. Change into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
4. Generate Prisma client and run database migrations as needed:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
5. Start the backend locally:
   ```bash
   npm run start:dev
   ```

### Frontend

1. Change into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --no-package-lock
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

### `backend/`

- `src/` — NestJS application source code
- `prisma/` — Prisma schema, migrations, and seed files
- `package.json` — backend dependency and script configuration
- `tsconfig.json` — backend TypeScript configuration
- `README.md` — backend-specific developer instructions

### `frontend/`

- `app/` — Next.js application routes and pages
- `components/` — reusable UI components
- `lib/` — frontend services and client utilities
- `public/` — static assets
- `package.json` — frontend dependency and script configuration
- `tsconfig.json` — frontend TypeScript configuration
- `README.md` — frontend-specific developer instructions

## API Overview

The backend exposes a REST API under `api/v1`. Example endpoints include:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/users`
- `GET /api/v1/courses`
- `GET /api/v1/quizzes`

Check `backend/src` for the full controller/module structure.

## Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this repository.

## License

This repository is licensed under the MIT License. See [LICENSE](LICENSE) for details.
