import { getNhostPublicConfig } from "@/lib/nhost/config";

export function nhostAuthBaseUrl(): string | null {
  const { subdomain, region } = getNhostPublicConfig();
  if (subdomain === "local" || region === "local") return null;
  return `https://${subdomain}.auth.${region}.nhost.run/v1`;
}
