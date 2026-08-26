import { describe, expect, it } from "vitest";
import { canPublishContract, isPublishedContract, requireKnownFacts } from "./facts";

describe("contrato de IA", () => {
  it("recusa fabricar dados ausentes", () => {
    const result = requireKnownFacts(
      { userId: "u1", hasBirthDate: false, hasRecentMeasurement: true, hasProgram: false },
      ["hasBirthDate", "hasProgram"],
    );
    expect(result).toEqual({
      ok: false,
      error: {
        code: "missing_data",
        fields: ["data de nascimento", "programa de treino"],
      },
    });
  });

  it("atleta não publica contrato; só versão published é visível", () => {
    expect(canPublishContract("user")).toBe(false);
    expect(canPublishContract("admin")).toBe(false);
    expect(canPublishContract("super_admin")).toBe(true);
    expect(isPublishedContract("draft")).toBe(false);
    expect(isPublishedContract("published")).toBe(true);
  });
});
