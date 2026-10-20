import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same-origin API access: the client only ever calls `/api/...`, and the
  // dev server proxies to Express. Cookies flow through untouched, so there
  // is no CORS setup needed between the two apps in development.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_PROXY_URL ?? "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
  // The shared validation package ships TypeScript source.
  transpilePackages: ["@ph/shared"],
};

export default nextConfig;
