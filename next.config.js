/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  // 通常のWebpack設定（Turbopack無効化）
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        net: false,
        tls: false,
        fs: false,
        stream: false,
        perf_hooks: false,
        os: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
