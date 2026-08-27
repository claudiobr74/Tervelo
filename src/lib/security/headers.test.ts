import { describe, expect, it } from "vitest";
import { PERMISSIONS_POLICY, securityHeaders } from "@/lib/security/headers";

describe("security headers", () => {
  it("define nosniff, frame deny e referrer", () => {
    const headers = securityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
  });

  it("bloqueia câmera/mic/geo e mantém bluetooth para FC", () => {
    expect(PERMISSIONS_POLICY).toContain("camera=()");
    expect(PERMISSIONS_POLICY).toContain("microphone=()");
    expect(PERMISSIONS_POLICY).toContain("geolocation=()");
    expect(PERMISSIONS_POLICY).toContain("bluetooth=(self)");
  });
});
