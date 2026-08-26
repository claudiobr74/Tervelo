import { describe, expect, it } from "vitest";
import { classifyChange, dailyCheckinMayChange, evaluateChangeBudget } from "./change-budget";

describe("Orçamento de Mudanças", () => {
  it("bloqueia várias alterações simultâneas sem justificativa forte", () => {
    const result = evaluateChangeBudget([
      { id: "v", scope: "ALTERACAO_DO_PROGRAMA", axis: "volume", justification: "weak" },
      { id: "e1", scope: "ALTERACAO_DO_PROGRAMA", axis: "exercise", justification: "weak" },
      { id: "f", scope: "ALTERACAO_DO_PROGRAMA", axis: "frequency", justification: "weak" },
      { id: "n", scope: "ALTERACAO_DO_PROGRAMA", axis: "nutrition", justification: "weak" },
    ]);
    expect(result.ok).toBe(false);
    expect(result.allowed.length).toBe(1);
  });

  it("classifica pouco tempo como ajuste da sessão", () => {
    expect(
      classifyChange({
        timeShortage: true,
        equipmentUnavailable: false,
        acuteRecoveryReduced: false,
        discomfort: false,
        redistributeWeekVolume: false,
        changeSplitOrBlock: false,
        deload: false,
        nutritionStrategyChange: false,
      }),
    ).toBe("AJUSTE_DA_SESSAO");
  });

  it("check-in diário não pode alterar o programa", () => {
    expect(dailyCheckinMayChange("AJUSTE_DA_SESSAO")).toBe(true);
    expect(dailyCheckinMayChange("ALTERACAO_DO_PROGRAMA")).toBe(false);
  });
});
