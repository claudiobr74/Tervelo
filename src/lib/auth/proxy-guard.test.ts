import { describe, expect, it } from "vitest";
import { isPublicPath, resolveAuthRedirect } from "@/lib/auth/proxy-guard";

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

  it("atleta sem sessão vai para login em /app", () => {
    expect(resolveAuthRedirect("/app/today", null, false, false)).toBe("/login");
    expect(resolveAuthRedirect("/onboarding/perfil", null, false, false)).toBe("/login");
  });

  it("user sem admin volta para a home em /admin", () => {
    expect(resolveAuthRedirect("/admin", { preview: true, previewRole: "user" }, true, true)).toBe("/");
    expect(resolveAuthRedirect("/admin", { preview: true, previewRole: "admin" }, true, true)).toBeNull();
  });

  it("login com sessão redireciona", () => {
    expect(resolveAuthRedirect("/login", { preview: true }, true, true)).toBe("/app/today");
    expect(resolveAuthRedirect("/login", { preview: true }, true, false)).toBe("/onboarding/perfil");
  });

  it("onboarding concluído não reabre o fluxo", () => {
    expect(resolveAuthRedirect("/onboarding/perfil", { preview: true }, true, true)).toBe("/app/today");
    expect(resolveAuthRedirect("/onboarding/nutricao", { preview: true }, true, false)).toBeNull();
  });

  it("SW e health não redirecionam", () => {
    expect(resolveAuthRedirect("/sw.js", null, false, false)).toBeNull();
    expect(resolveAuthRedirect("/api/health", null, false, false)).toBeNull();
  });
});
