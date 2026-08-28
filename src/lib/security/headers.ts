/**
 * Origens do backend liberadas para XHR/WebSocket. Sem isso a CSP precisaria
 * permitir `https:` inteiro, o que anula boa parte da proteção contra exfiltração.
 * As variáveis são lidas direto do ambiente porque este módulo também é
 * carregado pelo `next.config`, fora do alias `@/`.
 */
function nhostOrigins(): string[] {
  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "local";
  const region = process.env.NEXT_PUBLIC_NHOST_REGION || "local";
  if (subdomain === "local") return [];
  return [
    `https://${subdomain}.auth.${region}.nhost.run`,
    `https://${subdomain}.graphql.${region}.nhost.run`,
    `https://${subdomain}.storage.${region}.nhost.run`,
    `https://${subdomain}.functions.${region}.nhost.run`,
    `wss://${subdomain}.graphql.${region}.nhost.run`,
  ];
}

function connectSrc(): string {
  const local =
    process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:*", "http://127.0.0.1:*", "ws://localhost:*", "ws://127.0.0.1:*"];
  return ["'self'", ...nhostOrigins(), ...local].join(" ");
}

function scriptSrc(nonce?: string): string {
  if (nonce) {
    // `strict-dynamic` deixa o Next carregar seus próprios bundles a partir do
    // script com nonce, sem precisar liberar todo inline.
    const base = `'self' 'nonce-${nonce}' 'strict-dynamic'`;
    return process.env.NODE_ENV === "production" ? base : `${base} 'unsafe-eval'`;
  }
  return process.env.NODE_ENV === "production"
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval'";
}

/**
 * CSP para App Router + PWA + Nhost. O bootstrap de tema é inline e recebe o
 * nonce gerado por requisição no proxy. Bluetooth não entra em CSP.
 */
export function contentSecurityPolicy(nonce?: string): string {
  const parts = [
    "default-src 'self'",
    `script-src ${scriptSrc(nonce)}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSrc()}`,
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

export const HSTS = "max-age=31536000; includeSubDomains";

/** Cabeçalho interno que leva o nonce do proxy até o layout. */
export const NONCE_HEADER = "x-tervelo-nonce";

export function securityHeaders(nonce?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Security-Policy": contentSecurityPolicy(nonce),
    "Permissions-Policy": PERMISSIONS_POLICY,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-DNS-Prefetch-Control": "off",
  };
  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = HSTS;
  }
  return headers;
}

/** Cabeçalhos estáticos do `next.config`. A CSP com nonce é aplicada no proxy. */
export function securityHeaderList(): { key: string; value: string }[] {
  return Object.entries(securityHeaders())
    .filter(([key]) => key !== "Content-Security-Policy")
    .map(([key, value]) => ({ key, value }));
}
