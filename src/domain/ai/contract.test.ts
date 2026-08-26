import { describe, expect, it } from "vitest";
import {
  AI_AUTONOMY_ACTIONS,
  AI_CONTRACT_PREVIEW,
  AI_IDENTITY_PROMPT,
  AI_POLICY_LOCKS,
  DEFAULT_AI_AUTONOMY,
  DEFAULT_AI_TONES,
} from "./contract";

describe("contrato de IA (admin)", () => {
  it("usa nomes por extenso na matriz de autonomia", () => {
    expect(AI_AUTONOMY_ACTIONS.map((action) => action.label)).toEqual([
      "Progressão de carga",
      "Volume de treino",
      "Substituição de exercício",
      "Ajuste nutricional",
    ]);
    expect(DEFAULT_AI_AUTONOMY.load_progression).toBe("confirmar");
    expect(DEFAULT_AI_AUTONOMY.training_volume).toBe("auto");
  });

  it("mantém identidade e tons padrão do Figma", () => {
    expect(AI_IDENTITY_PROMPT).toContain("Coach de IA do Tervelo");
    expect(DEFAULT_AI_TONES).toEqual(["Técnico", "Motivacional"]);
    expect(AI_CONTRACT_PREVIEW.stateLabel).toBe("Publicado");
  });

  it("não deixa políticas críticas no jsonb configurável", () => {
    expect(AI_POLICY_LOCKS.some((rule) => rule.includes("Não fabricar dados"))).toBe(true);
    expect(AI_POLICY_LOCKS.some((rule) => rule.includes("super_admin"))).toBe(true);
  });
});
