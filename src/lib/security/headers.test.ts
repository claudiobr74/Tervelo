import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, PERMISSIONS_POLICY, securityHeaders } from "@/lib/security/headers";

describe("security headers", () => {
  it("define nosniff, frame deny e referrer", () => {
    const headers = securityHeaders();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
  });

  it("com nonce, não libera script inline", () => {
    const csp = contentSecurityPolicy("abc123");
    const scriptSrc = csp.split("; ").find((part) => part.startsWith("script-src"));
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("não permite conectar a qualquer origem https", () => {
    const csp = contentSecurityPolicy();
    const connect = csp.split("; ").find((part) => part.startsWith("connect-src"));
    expect(connect).toBeDefined();
    expect(connect).not.toContain(" https: ");
    expect(connect).not.toMatch(/ wss:( |$)/);
  });

  it("bloqueia câmera/mic/geo e mantém bluetooth para FC", () => {
    expect(PERMISSIONS_POLICY).toContain("camera=()");
    expect(PERMISSIONS_POLICY).toContain("microphone=()");
    expect(PERMISSIONS_POLICY).toContain("geolocation=()");
    expect(PERMISSIONS_POLICY).toContain("bluetooth=(self)");
  });
});
