import { createRemoteJWKSet, jwtVerify } from "jose";
import { getNhostPublicConfig } from "@/lib/nhost/config";

/**
 * Verifica a assinatura do access token contra o JWKS do Nhost.
 * Sem isso, qualquer cliente poderia montar um JWT com claim de administrador:
 * decodificar o payload não prova nada sobre a origem do token.
 */
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let cachedIssuer: string | null = null;

export function nhostAuthIssuer(): string | null {
  const { subdomain, region } = getNhostPublicConfig();
  if (subdomain === "local") return null;
  return `https://${subdomain}.auth.${region}.nhost.run/v1`;
}

function jwks(issuer: string) {
  if (!cachedJwks || cachedIssuer !== issuer) {
    cachedJwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    cachedIssuer = issuer;
  }
  return cachedJwks;
}

export async function verifyAccessToken(
  token: string | undefined | null,
): Promise<Record<string, unknown> | null> {
  const issuer = nhostAuthIssuer();
  if (!issuer || !token || token === "preview") return null;
  try {
    const { payload } = await jwtVerify(token, jwks(issuer));
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}
