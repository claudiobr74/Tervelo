import { describe, expect, it } from "vitest";
import { previewSession, previewUserIdFromEmail } from "@/lib/auth/local-preview";

describe("previewUserIdFromEmail", () => {
  it("gera uuid estável e diferente por e-mail", () => {
    const ana = previewUserIdFromEmail("ana@tervelo.local");
    const joao = previewUserIdFromEmail("joao@tervelo.local");
    expect(ana).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(ana).toBe(previewUserIdFromEmail("ANA@tervelo.local"));
    expect(ana).not.toBe(joao);
  });

  it("não reutiliza o mesmo id de atleta para e-mails diferentes", () => {
    const one = previewSession({ email: "ana@tervelo.local" });
    const two = previewSession({ email: "joao@tervelo.local" });
    expect(one.user.id).not.toBe(two.user.id);
    expect(one.user.displayName).toBe("ana");
  });
});
