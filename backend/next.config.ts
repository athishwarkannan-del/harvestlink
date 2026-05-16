import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Backend-only project: no image optimisation, no static export needed
  // CORS headers for all /api/* routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.FRONTEND_URL ?? "*" },
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
