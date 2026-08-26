import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 bloqueia scripts cross-origin no `next dev`. Playwright e o
  // browser do agente usam 127.0.0.1 ou localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
