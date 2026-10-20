import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS v4 is compiled by the official Turbopack loader
  // (this scaffold uses no postcss.config; without this rule the
  // `@theme` / `@utility` directives are dropped and the app renders unstyled).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
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
