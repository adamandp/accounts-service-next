import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
).origin;

// Cache Components and prerendering require Next.js inline bootstrap scripts.
// This baseline CSP restricts external sources; nonce-based script CSP would
// require a rendering architecture change.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (isDev ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:" + (isDev ? " http:" : ""),
  "font-src 'self' data:",
  "connect-src 'self' " + apiOrigin + (isDev ? " ws: wss:" : ""),
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const useApiProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === "true";

const nextConfig: NextConfig = {
  basePath,
  async rewrites() {
    if (!useApiProxy) return [];
    return [{ source: "/api/:path*", destination: apiOrigin + "/:path*" }];
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
