import type { NextConfig } from "next";

// Sanitize FRONTEND_URL to strip any trailing slashes to prevent browser CORS mismatches
const getSanitizedFrontendUrl = (): string => {
  let url = process.env.FRONTEND_URL || "*";
  url = url.trim();
  while (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

const nextConfig: NextConfig = {
  // Backend-only project: no image optimisation, no static export needed
  // CORS headers for all /api/* routes
  async headers() {
    const frontendUrl = getSanitizedFrontendUrl();
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: frontendUrl },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization,Content-Type,X-Requested-With",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
