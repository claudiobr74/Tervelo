import { getNhostPublicConfig } from "@/lib/nhost/config";

export const PREVIEW_USER_ID = "11111111-1111-4111-8111-111111111111";
export const PREVIEW_ADMIN_ID = "22222222-2222-4222-8222-222222222222";

export function isLocalNhost(): boolean {
  return getNhostPublicConfig().subdomain === "local";
}

/** UUID estável por e-mail, para contas de pré-visualização não compartilharem o IndexedDB. */
export function previewUserIdFromEmail(email: string): string {
  const seed = email.trim().toLowerCase();
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const block = (hex + hex + hex + hex).slice(0, 32);
  return `${block.slice(0, 8)}-${block.slice(8, 12)}-4${block.slice(13, 16)}-8${block.slice(17, 20)}-${block.slice(20, 32)}`;
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
      id: previewRole === "admin" ? PREVIEW_ADMIN_ID : previewUserIdFromEmail(user.email),
      displayName: user.displayName || user.email.split("@")[0],
      email: user.email,
    },
  };
}
