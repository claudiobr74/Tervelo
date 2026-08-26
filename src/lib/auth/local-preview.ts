import { getNhostPublicConfig } from "@/lib/nhost/config";

export function isLocalNhost(): boolean {
  return getNhostPublicConfig().subdomain === "local";
}

export function previewSession(user: { displayName?: string; email: string }) {
  return {
    accessToken: "preview",
    refreshToken: "preview",
    preview: true as const,
    user: {
      id: "preview-user",
      displayName: user.displayName || user.email.split("@")[0],
      email: user.email,
    },
  };
}
