import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// package.json에서 버전 정보 읽기
const pkg = require('./package.json');

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Docker 배포를 위한 standalone 출력
  output: "standalone",
  // 빌드 시점에 환경 변수 주입
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
  },
  // FFmpeg WASM을 위한 CORS 헤더 설정
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
    ];
  },
  // 외부 이미지 도메인 허용
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Webpack 설정 (FFmpeg WASM 지원)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
