import { describe, expect, it } from "vitest";
import { sanitizeSessionPayload } from "@/lib/security/session-payload";

describe("sanitizeSessionPayload", () => {
  it("aceita sessão Nhost e descarta previewRole sem preview", () => {
    const result = sanitizeSessionPayload(
      {
        accessToken: "jwt-token",
        refreshToken: "refresh",
        previewRole: "admin",
        extra: "drop",
        user: {
          id: "u1",
          displayName: "Lucas",
          email: "lucas.atleta@gmail.com",
          passwordHash: "nope",
        },
      },
      { allowPreview: false },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.session.preview).toBeUndefined();
    expect(result.session.previewRole).toBeUndefined();
    expect(result.session.user).toEqual({
      id: "u1",
      displayName: "Lucas",
      email: "lucas.atleta@gmail.com",
    });
    expect(result.session).not.toHaveProperty("extra");
  });

  it("recusa preview em production", () => {
    const result = sanitizeSessionPayload(
      { accessToken: "preview", preview: true, previewRole: "admin" },
      { allowPreview: false },
    );
    expect(result).toEqual({ ok: false, reason: "preview_forbidden" });
  });

  it("permite preview local só com papel explícito ou user", () => {
    const admin = sanitizeSessionPayload(
      { accessToken: "preview", preview: true, previewRole: "admin" },
      { allowPreview: true },
    );
    expect(admin.ok).toBe(true);
    if (admin.ok) expect(admin.session.previewRole).toBe("admin");

    const user = sanitizeSessionPayload(
      { accessToken: "preview", preview: true },
      { allowPreview: true },
    );
    expect(user.ok).toBe(true);
    if (user.ok) expect(user.session.previewRole).toBe("user");
  });

  it("recusa payload vazio ou token ausente", () => {
    expect(sanitizeSessionPayload({}, { allowPreview: true }).ok).toBe(false);
    expect(sanitizeSessionPayload(null, { allowPreview: true }).ok).toBe(false);
    expect(sanitizeSessionPayload({ accessToken: "" }, { allowPreview: true }).ok).toBe(false);
  });
});
