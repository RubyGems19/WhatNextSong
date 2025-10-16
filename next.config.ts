import type { NextConfig } from 'next';

// Set your repo name (for project sites like https://username.github.io/<repo>/)
// If you're deploying to a *user site* (https://username.github.io), set repo = ''.
const repo = 'WhatNextSong' as const;
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // Base path & asset prefix only in production (for project sites)
  basePath: isProd && repo ? `/${repo}` : '',
  assetPrefix: isProd && repo ? `/${repo}/` : '',

  // Disable next/image optimization on GH Pages
  images: { unoptimized: true },

  // (Optional) headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60' },
          { key: 'Permissions-Policy', value: 'interest-cohort=()' },
        ],
      },
    ];
  },

  // Useful for building manifest/paths in the app
  env: { NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : '' },

  // Keep if you’re using server actions
  experimental: { serverActions: { allowedOrigins: ['*'] } },
} satisfies NextConfig;

export default nextConfig;
