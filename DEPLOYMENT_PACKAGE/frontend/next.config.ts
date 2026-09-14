/**
 * Next.js Configuration - Cloudflare Pages (OpenNext)
 */
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 本地开发时初始化 Cloudflare 绑定
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  // 不需要 standalone，OpenNext 自己处理输出

  // 图片优化 - 使用自定义 loader 替代 Vercel Image Optimization
  images: {
    loader: "custom",
    loaderFile: "./lib/cf-image-loader.ts",
    remotePatterns: [
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: 'pub-a6a4ae7f5151464cb2be257af37faafe.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'ceec996a81ee29acc1eb188b0a2017e4.r2.cloudflarestorage.com',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Travel Off Path
      {
        protocol: 'https',
        hostname: 'www.traveloffpath.com',
      },
      // BBC
      {
        protocol: 'https',
        hostname: 'www.bbc.com',
      },
      {
        protocol: 'https',
        hostname: 'static.files.bbci.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Webpack 配置 - 客户端不需要 nodejs 模块
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  compress: true,
  productionBrowserSourceMaps: false,
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
