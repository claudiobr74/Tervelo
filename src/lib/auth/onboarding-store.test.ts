import { describe, expect, it } from "vitest";
import { DEFAULT_ONBOARDING } from "@/lib/auth/onboarding";
import { parseOnboardingDraft } from "@/lib/auth/onboarding-store";

describe("parseOnboardingDraft", () => {
  it("volta ao padrão quando o rascunho está vazio ou inválido", () => {
    expect(parseOnboardingDraft(null)).toEqual(DEFAULT_ONBOARDING);
    expect(parseOnboardingDraft("{")).toEqual(DEFAULT_ONBOARDING);
  });

  it("preserva medidas preenchidas depois do onboarding", () => {
    const parsed = parseOnboardingDraft(
      JSON.stringify({ displayName: "Lucas", chestCm: "104", waistCm: "84" }),
    );
    expect(parsed.displayName).toBe("Lucas");
    expect(parsed.chestCm).toBe("104");
    expect(parsed.waistCm).toBe("84");
    expect(parsed.sex).toBe(DEFAULT_ONBOARDING.sex);
    expect(parsed.completed).toBe(false);
  });
});
