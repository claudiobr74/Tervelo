const SCRIPT_SRC =
  process.env.NODE_ENV === "production"
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval'";

const CONNECT_SRC = [
  "'self'",
  "https:",
  "wss:",
  "http://localhost:*",
  "http://127.0.0.1:*",
  "ws://localhost:*",
  "ws://127.0.0.1:*",
].join(" ");

/**
 * CSP mínima para App Router + PWA + Nhost.
 * Script inline: bootstrap de tema. Bluetooth não entra em CSP.
 * `upgrade-insecure-requests` só em production (dev usa http).
 */
export function contentSecurityPolicy(): string {
  const parts = [
    "default-src 'self'",
    `script-src ${SCRIPT_SRC}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${CONNECT_SRC}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("upgrade-insecure-requests");
  }
  return parts.join("; ");
}

/** Câmera/mic/geo off. Bluetooth explícito para frequência cardíaca (Phase 11). */
export const PERMISSIONS_POLICY =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(self)";

export function securityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": contentSecurityPolicy(),
    "Permissions-Policy": PERMISSIONS_POLICY,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-DNS-Prefetch-Control": "off",
  };
}

export function securityHeaderList(): { key: string; value: string }[] {
  return Object.entries(securityHeaders()).map(([key, value]) => ({ key, value }));
}
