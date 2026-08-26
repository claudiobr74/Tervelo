import { describe, expect, it } from "vitest";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/auth/password";
import { parseSessionCookie, sessionHasAdminAccess } from "@/lib/auth/session-cookie";

describe("auth", () => {
  it("senha mínima alinha com nhost.toml (9)", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(9);
  });

  it("valida e-mail", () => {
    expect(isValidEmail("lucas.atleta@gmail.com")).toBe(true);
    expect(isValidEmail("invalido")).toBe(false);
  });

  it("lê cookie de sessão", () => {
    expect(parseSessionCookie(undefined)).toBeNull();
    expect(parseSessionCookie("{")).toBeNull();
    expect(parseSessionCookie(JSON.stringify({ preview: true, user: { email: "a@b.c" } }))).toMatchObject({
      preview: true,
    });
  });

  it("pré-visualização admin só com previewRole", () => {
    expect(sessionHasAdminAccess({ preview: true, previewRole: "admin" })).toBe(true);
    expect(sessionHasAdminAccess({ preview: true, previewRole: "user" })).toBe(false);
    expect(sessionHasAdminAccess({ preview: true })).toBe(false);
  });
});
