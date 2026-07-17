# Deploying the Siaya LMS to the hub server

Same pattern as **EduLedger** (`fee-ledger-system`) on the same box: **PM2** runs
both apps, a **Cloudflare Tunnel** publishes them over HTTPS (no nginx, no certbot),
and **system PostgreSQL** holds the data. One new dependency vs EduLedger: **Redis**
(the backend uses BullMQ queues).

```
Internet ─HTTPS─> Cloudflare ─tunnel─> learn.<domain>      -> localhost:3100 (siaya-web / Next.js)
                                       api.learn.<domain>  -> localhost:5000 (siaya-api / NestJS)
                              siaya-api -> PostgreSQL + Redis (localhost)
```

Ports are chosen to avoid EduLedger's (web 3000, api 4000): **web 3100, api 5000.**

---

## 0. Pick subdomains
- Web: `learn.<yourdomain>`
- API: `api.learn.<yourdomain>`

Replace `learn.example.com` / `api.learn.example.com` throughout.

## 1. Server prerequisites (once)
```bash
node -v            # need Node 20+ (nvm or nodesource). EduLedger already uses it.
pm2 -v             # already installed for EduLedger
psql --version     # system PostgreSQL already runs for EduLedger

# Redis is NEW for this app:
sudo apt update && sudo apt install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping     # -> PONG
```

## 2. Create the database (reuse the existing PostgreSQL server)
```bash
sudo -u postgres psql <<'SQL'
CREATE USER siaya WITH PASSWORD 'CHANGE_ME_DB_PASSWORD';
CREATE DATABASE sicodihub_lms OWNER siaya;
GRANT ALL PRIVILEGES ON DATABASE sicodihub_lms TO siaya;
SQL
```

## 3. Get the code
```bash
sudo mkdir -p /opt/siaya-lms && sudo chown $USER:$USER /opt/siaya-lms
git clone https://github.com/Geotech-ally/Siaya-Community-Digital-Hub-Learning-Platfrom.git /opt/siaya-lms
cd /opt/siaya-lms
```

## 4. Configure environment
```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
openssl rand -hex 32   # -> JWT_ACCESS_SECRET
openssl rand -hex 32   # -> JWT_REFRESH_SECRET
```
- `backend/.env`: set `DATABASE_URL` (the `siaya` user + password from step 2), the two JWT secrets, and `CORS_ORIGIN=https://learn.<yourdomain>`. Redis defaults (localhost) are fine.
- `frontend/.env`: set `NEXT_PUBLIC_API_URL=https://api.learn.<yourdomain>` **before building** (it's baked in).

## 5. First build + start under PM2
```bash
cd /opt/siaya-lms
bash deploy.sh                 # installs, migrates, builds both, then pm2 reload
# first time only — register the apps and save the process list:
pm2 start ecosystem.config.js
pm2 save
```
Local smoke test (still on the server):
```bash
curl -I http://localhost:3100                       # -> 200 (Next.js)
curl -s http://localhost:5000/api/v1/public/home    # -> backend JSON
```
> The very first deploy has no migrations applied yet; `prisma migrate deploy` in
> `deploy.sh` creates the schema. To seed an admin, see the note at the bottom.

## 6. Publish via the existing Cloudflare Tunnel
Add **two Public Hostnames** to your tunnel (Zero Trust → Networks → Tunnels →
your tunnel → Public Hostnames):

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `learn` | `<yourdomain>` | HTTP | `localhost:3100` |
| `api.learn` | `<yourdomain>` | HTTP | `localhost:5000` |

Cloudflare auto-creates the DNS records. Then open `https://learn.<yourdomain>`.

(If the tunnel is file-managed instead of dashboard-managed, add two `ingress`
rules for those hostnames pointing at the two localhost ports, run
`cloudflared tunnel route dns <tunnel> learn.<domain>` and the api one, then restart cloudflared.)

## Redeploy (keep building)
```bash
cd /opt/siaya-lms && bash deploy.sh
```

---

## Notes / to sort
- **Seeding an admin**: `backend/prisma/seed.ts` runs via `ts-node` (a devDependency, present after `npm install`). Run once: `cd /opt/siaya-lms/backend && npx ts-node prisma/seed.ts` (or wire a `prisma.seed` entry). Until then self-registration only makes LEARNER accounts.
- **CORS**: backend still uses `enableCors()` (open). Lock to `CORS_ORIGIN` before real launch.
- **Do NOT** run `pm2 delete all` — the box also runs EduLedger's PM2 apps.
- **Backups**: add a `pg_dump` cron for `sicodihub_lms` before going live.
- Node's `--strict-ssl=false` in `deploy.sh` matches EduLedger (the hub network does SSL interception).
