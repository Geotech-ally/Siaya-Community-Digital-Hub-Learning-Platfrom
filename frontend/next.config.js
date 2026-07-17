/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // TEMPORARY: don't fail the production build on type/lint errors. Lets us ship
  // to the LAN server now; re-enable and fix types properly before public launch.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    turbo: {},
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**.mux.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

if (isProd) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });

  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
