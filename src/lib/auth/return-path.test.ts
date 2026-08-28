import { describe, expect, it } from "vitest";
import { loginPathWithNext, resolvePostLoginPath, safeReturnPath } from "@/lib/auth/return-path";

describe("return path", () => {
  it("aceita só rotas internas", () => {
    expect(safeReturnPath("/admin")).toBe("/admin");
    expect(safeReturnPath("/admin/users")).toBe("/admin/users");
    expect(safeReturnPath("/admin/training")).toBe("/admin/training");
    expect(safeReturnPath("/admin/nutrition")).toBe("/admin/nutrition");
    expect(safeReturnPath("/admin/settings")).toBe("/admin/settings");
    expect(safeReturnPath("/app/today")).toBe("/app/today");
    expect(safeReturnPath("/onboarding/perfil")).toBe("/onboarding/perfil");
    expect(safeReturnPath("https://evil.example/admin")).toBe("/admin");
    expect(safeReturnPath("//evil.example")).toBeNull();
    expect(safeReturnPath("/login")).toBeNull();
    expect(safeReturnPath("/")).toBeNull();
  });

  it("admin sem sessão volta ao login com next", () => {
    expect(loginPathWithNext("/admin")).toBe("/login?next=%2Fadmin");
    expect(loginPathWithNext("/admin/ai")).toBe("/login?next=%2Fadmin%2Fai");
    expect(loginPathWithNext("/admin/training")).toBe("/login?next=%2Fadmin%2Ftraining");
    expect(loginPathWithNext("/app/today")).toBe("/login");
  });

  it("depois do login o admin vai ao console", () => {
    expect(resolvePostLoginPath({ admin: true, onboardingDone: false })).toBe("/admin");
    expect(resolvePostLoginPath({ admin: true, onboardingDone: true, next: "/admin/users" })).toBe(
      "/admin/users",
    );
    expect(resolvePostLoginPath({ admin: false, onboardingDone: true, next: "/admin" })).toBe(
      "/app/today",
    );
    expect(resolvePostLoginPath({ admin: false, onboardingDone: false })).toBe(
      "/onboarding/perfil",
    );
  });
});
