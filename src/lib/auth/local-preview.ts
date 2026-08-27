import { getNhostPublicConfig } from "@/lib/nhost/config";

export const PREVIEW_USER_ID = "11111111-1111-4111-8111-111111111111";
export const PREVIEW_ADMIN_ID = "22222222-2222-4222-8222-222222222222";

export function isLocalNhost(): boolean {
  return getNhostPublicConfig().subdomain === "local";
}

export function previewSession(
  user: { displayName?: string; email: string },
  previewRole: "user" | "admin" = "user",
) {
  return {
    accessToken: "preview",
    refreshToken: "preview",
    preview: true as const,
    previewRole,
    user: {
      id: previewRole === "admin" ? PREVIEW_ADMIN_ID : PREVIEW_USER_ID,
      displayName: user.displayName || user.email.split("@")[0],
      email: user.email,
    },
  };
}
