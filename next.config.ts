import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 أيام
  },
  experimental: {
    optimizePackageImports: ['@/components', '@/lib']
  },
  turbopack: {},
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transpilePackages: [],
  // Exclude mobile app from build
  webpack: (config, { isServer }) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /FruitQ8Mobile/,
      loader: 'ignore-loader'
    });
    return config;
  },
};

export default nextConfig;
