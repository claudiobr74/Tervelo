import { describe, expect, it } from "vitest";
import { matchExerciseAliases, normalizeSearchText } from "./aliases";

describe("aliases de exercício", () => {
  it("normaliza acento e maiúsculas", () => {
    expect(normalizeSearchText("  Supino Reto ")).toBe("supino reto");
    expect(normalizeSearchText("BENCH PRESS")).toBe("bench press");
  });

  it("não duplica o canônico por fabricante — busca por alias", () => {
    const aliases = [
      { canonicalExerciseId: "ex-supino", alias: "supino reto" },
      { canonicalExerciseId: "ex-supino", alias: "bench press" },
      { canonicalExerciseId: "ex-supino", alias: "supino horizontal" },
    ];
    expect(matchExerciseAliases("bench", aliases)).toEqual(["ex-supino"]);
    expect(matchExerciseAliases("supino", aliases)).toEqual(["ex-supino"]);
  });
});
