import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
