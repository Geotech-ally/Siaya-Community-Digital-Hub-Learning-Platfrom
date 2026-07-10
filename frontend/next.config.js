/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
      { protocol: "https", hostname: "**.mux.com" },
      { protocol: "https", hostname: "image.mux.com" },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000/api/v1",
  },

  compress: true,
  poweredByHeader: false,
};

// Only enable PWA in production
if (!isDev) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
  });

  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}