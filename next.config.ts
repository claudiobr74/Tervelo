import type { NextConfig } from "next";
import { securityHeaderList } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next 16 bloqueia scripts cross-origin no `next dev`. Playwright e o
  // browser do agente usam 127.0.0.1 ou localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaderList() }];
  },
};

export default nextConfig;
