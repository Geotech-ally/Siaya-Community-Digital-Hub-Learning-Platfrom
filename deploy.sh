#!/bin/bash
# Deploy the Siaya LMS on the hub server. Mirrors fee-ledger-system/deploy.sh.
# Run from /opt/siaya-lms:   bash deploy.sh
set -e

ROOT=/opt/siaya-lms
cd "$ROOT"

# Discard lockfile drift before pull (lockfiles are committed from Windows dev
# and rarely match byte-for-byte after a server-side npm install).
echo ">>> Resetting any drift in lockfiles..."
git checkout -- backend/package-lock.json frontend/package-lock.json 2>/dev/null || true

echo ">>> Pulling latest code..."
git pull

echo ">>> Installing backend dependencies..."
cd "$ROOT/backend"
npm install --strict-ssl=false

echo ">>> Running DB migrations..."
npx prisma migrate deploy

echo ">>> Regenerating Prisma client..."
npx prisma generate

echo ">>> Building backend..."
npm run build

echo ">>> Installing frontend dependencies..."
cd "$ROOT/frontend"
npm install --strict-ssl=false

echo ">>> Building frontend (NEXT_PUBLIC_API_URL is baked in here — ensure frontend/.env is set)..."
npm run build

echo ">>> Restarting services..."
cd "$ROOT"
pm2 reload ecosystem.config.js --update-env

echo ">>> Done."
