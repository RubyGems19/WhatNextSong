/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=60' },
        { key: 'Permissions-Policy', value: 'interest-cohort=()' },
      ],
    },
  ],
};

module.exports = nextConfig;
