// PM2 process config — mirrors the EduLedger (fee-ledger-system) setup on the
// same hub server. Ports are chosen to NOT collide with EduLedger
// (fee-ledger-web=3000, fee-ledger-api=4000).
//
//   siaya-api  -> localhost:5000   (Cloudflare Tunnel: api.<subdomain>)
//   siaya-web  -> localhost:3100   (Cloudflare Tunnel: <subdomain>)
//
// Deploy path assumed: /opt/siaya-lms  (see deploy/DEPLOY.md)
module.exports = {
  apps: [
    {
      name: 'siaya-api',
      // nest build keeps the src/ prefix because prisma/ and lib/ sit outside
      // src/, so the entry is dist/src/main.js (NOT dist/main.js).
      script: 'dist/src/main.js',
      cwd: '/opt/siaya-lms/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production', PORT: 5000 },
    },
    {
      name: 'siaya-web',
      // Next's `next start` must run in fork mode — PM2 cluster mode makes it
      // crash-loop instantly with no output.
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/siaya-lms/frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production', PORT: 3100 },
    },
  ],
};
