import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/books/public/:path*',
        destination: '/api/cover?key=:path*',
      },
    ]
  }
};

export default nextConfig;
