import { describe, expect, it } from "vitest";
import { applySessionSubstitution, isMethodKind, TRAINING_HIERARCHY } from "./hierarchy";

describe("motor de treino", () => {
  it("hierarquia vai de objetivo até resultado", () => {
    expect(TRAINING_HIERARCHY).toEqual([
      "goal",
      "program",
      "block",
      "week",
      "session",
      "exercise",
      "set",
      "result",
    ]);
  });

  it("substituição de exercício não muta o programa", () => {
    const program = { id: "p1", title: "Hipertrofia", blocks: [{ id: "b1", position: 0 }] };
    const next = applySessionSubstitution(program, {
      sessionExerciseId: "se1",
      fromVariantId: "v1",
      toVariantId: "v2",
      reason: "aparelho ocupado",
    });
    expect(next).toEqual(program);
    expect(next.blocks[0].id).toBe("b1");
  });

  it("reconhece métodos de série", () => {
    expect(isMethodKind("drop_set")).toBe(true);
    expect(isMethodKind("ficha")).toBe(false);
  });
});
