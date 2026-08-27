import { z } from "zod";
import type { StoredAppSession } from "@/lib/auth/session-cookie";

const MAX_TOKEN = 20_000;
export const MAX_SESSION_BODY_BYTES = 32_768;

const sessionBodySchema = z
  .object({
    accessToken: z.string().min(1).max(MAX_TOKEN),
    refreshToken: z.string().max(MAX_TOKEN).optional(),
    accessTokenExpiresIn: z.number().finite().optional(),
    preview: z.boolean().optional(),
    previewRole: z.enum(["user", "admin"]).optional(),
    user: z
      .object({
        id: z.string().max(128).nullish(),
        displayName: z.string().max(200).nullish(),
        email: z.string().max(320).nullish(),
      })
      .strip()
      .optional(),
  })
  .strip();

export type SanitizeSessionResult =
  | { ok: true; session: StoredAppSession }
  | { ok: false; reason: "invalid_payload" | "preview_forbidden" };

export function sanitizeSessionPayload(
  input: unknown,
  options: { allowPreview: boolean },
): SanitizeSessionResult {
  const parsed = sessionBodySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "invalid_payload" };
  }

  const body = parsed.data;
  const user = body.user
    ? {
        id: body.user.id ?? undefined,
        displayName: body.user.displayName ?? undefined,
        email: body.user.email ?? undefined,
      }
    : undefined;

  if (body.preview) {
    if (!options.allowPreview) {
      return { ok: false, reason: "preview_forbidden" };
    }
    return {
      ok: true,
      session: {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        preview: true,
        previewRole: body.previewRole ?? "user",
        user,
      },
    };
  }

  return {
    ok: true,
    session: {
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
      user,
    },
  };
}

export function allowPreviewSessions(): boolean {
  return process.env.NODE_ENV !== "production";
}
