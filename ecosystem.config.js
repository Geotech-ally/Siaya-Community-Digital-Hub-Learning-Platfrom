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
      script: 'dist/main.js',
      cwd: '/opt/siaya-lms/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production', PORT: 5000 },
    },
    {
      name: 'siaya-web',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/opt/siaya-lms/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production', PORT: 3100 },
    },
  ],
};
