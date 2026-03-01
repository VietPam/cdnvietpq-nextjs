import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnvietpq.20522153.workers.dev',
        port: '',
        pathname: '/media/**', // Chỉ cho phép tối ưu ảnh trong thư mục media
      },
    ],
  },
};

export default nextConfig;
