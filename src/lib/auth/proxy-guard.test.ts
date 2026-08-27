import { describe, expect, it } from "vitest";
import { isPublicPath, resolveAuthRedirect, type AuthContext } from "@/lib/auth/proxy-guard";

function context(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    hasSession: false,
    adminAccess: false,
    onboardingDone: false,
    devToolsEnabled: true,
    ...overrides,
  };
}

describe("proxy guard", () => {
  it("rotas públicas incluem health, SW e manifest", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/health")).toBe(true);
    expect(isPublicPath("/sw.js")).toBe(true);
    expect(isPublicPath("/manifest.webmanifest")).toBe(true);
    expect(isPublicPath("/app/today")).toBe(false);
    expect(isPublicPath("/admin")).toBe(false);
  });

  it("atalhos de pré-visualização só existem sem backend real", () => {
    expect(isPublicPath("/dev", true)).toBe(true);
    expect(isPublicPath("/dev/tokens", true)).toBe(true);
    expect(isPublicPath("/dev", false)).toBe(false);
    expect(resolveAuthRedirect("/dev", context({ devToolsEnabled: false }))).toBe("/");
    expect(resolveAuthRedirect("/dev/tokens", context({ devToolsEnabled: false }))).toBe("/");
    expect(resolveAuthRedirect("/dev", context())).toBeNull();
  });

  it("atleta sem sessão vai para login em /app", () => {
    expect(resolveAuthRedirect("/app/today", context())).toBe("/login");
    expect(resolveAuthRedirect("/onboarding/perfil", context())).toBe("/login");
  });

  it("user sem admin volta para a home em /admin", () => {
    expect(resolveAuthRedirect("/admin", context({ hasSession: true, onboardingDone: true }))).toBe(
      "/",
    );
    expect(
      resolveAuthRedirect(
        "/admin",
        context({ hasSession: true, adminAccess: true, onboardingDone: true }),
      ),
    ).toBeNull();
  });

  it("login com sessão redireciona", () => {
    expect(resolveAuthRedirect("/login", context({ hasSession: true, onboardingDone: true }))).toBe(
      "/app/today",
    );
    expect(resolveAuthRedirect("/login", context({ hasSession: true }))).toBe("/onboarding/perfil");
  });

  it("onboarding concluído não reabre o fluxo", () => {
    expect(
      resolveAuthRedirect(
        "/onboarding/perfil",
        context({ hasSession: true, onboardingDone: true }),
      ),
    ).toBe("/app/today");
    expect(resolveAuthRedirect("/onboarding/nutricao", context({ hasSession: true }))).toBeNull();
  });

  it("SW e health não redirecionam", () => {
    expect(resolveAuthRedirect("/sw.js", context())).toBeNull();
    expect(resolveAuthRedirect("/api/health", context())).toBeNull();
  });
});
