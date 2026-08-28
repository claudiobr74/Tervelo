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
    expect(
      parseSessionCookie(JSON.stringify({ preview: true, user: { email: "a@b.c" } })),
    ).toMatchObject({
      preview: true,
    });
  });

  it("pré-visualização admin só com previewRole", async () => {
    await expect(sessionHasAdminAccess({ preview: true, previewRole: "admin" })).resolves.toBe(
      true,
    );
    await expect(sessionHasAdminAccess({ preview: true, previewRole: "user" })).resolves.toBe(
      false,
    );
    await expect(sessionHasAdminAccess({ preview: true })).resolves.toBe(false);
  });

  it("token não verificado nunca vira admin", async () => {
    // Payload com claim de administrador, mas sem assinatura válida do Nhost.
    const claims = Buffer.from(
      JSON.stringify({ "https://hasura.io/jwt/claims": { "x-hasura-allowed-roles": ["admin"] } }),
    ).toString("base64url");
    const forged = `eyJhbGciOiJub25lIn0.${claims}.`;
    await expect(sessionHasAdminAccess({ accessToken: forged })).resolves.toBe(false);
  });
});
