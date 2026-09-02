import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads (PDFs + cover images) through the admin panel.
  // Next.js App Router defaults to 4MB; raise to 50MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
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
