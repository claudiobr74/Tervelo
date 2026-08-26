export function getNhostPublicConfig(): { subdomain: string; region: string } {
  return {
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || "local",
    region: process.env.NEXT_PUBLIC_NHOST_REGION || "local",
  };
}

export const NHOST_SESSION_COOKIE = "nhostSession";
