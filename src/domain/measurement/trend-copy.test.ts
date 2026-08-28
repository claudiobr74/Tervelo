import { describe, expect, it } from "vitest";
import { bodyTrendCopy } from "@/domain/measurement/trend-copy";

describe("bodyTrendCopy", () => {
  it("não afirma nada sem medida", () => {
    expect(bodyTrendCopy({ weightDelta: null, waistDelta: null, fatDelta: null })).toBeNull();
  });

  it("reconhece ganho com cintura estável", () => {
    const copy = bodyTrendCopy({ weightDelta: 1.4, waistDelta: 0.2, fatDelta: null });
    expect(copy).toContain("massa magra");
  });

  it("avisa quando peso e cintura sobem juntos", () => {
    const copy = bodyTrendCopy({ weightDelta: 2.1, waistDelta: 2.4, fatDelta: 1.2 });
    expect(copy).toContain("superávit");
  });

  it("reconhece perda de gordura", () => {
    const copy = bodyTrendCopy({ weightDelta: -1.8, waistDelta: -1.5, fatDelta: -0.9 });
    expect(copy).toContain("perda de gordura");
  });

  it("reconhece recomposição", () => {
    const copy = bodyTrendCopy({ weightDelta: 0.1, waistDelta: null, fatDelta: -0.8 });
    expect(copy).toContain("Recomposição".toLowerCase());
  });

  it("descreve estabilidade sem prometer progresso", () => {
    const copy = bodyTrendCopy({ weightDelta: 0.1, waistDelta: 0.1, fatDelta: 0.1 });
    expect(copy).toContain("estáveis");
  });
});
