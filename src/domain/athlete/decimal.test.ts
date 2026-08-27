import { describe, expect, it } from "vitest";
import { parseDecimal, parseDecimalInRange } from "@/domain/athlete/decimal";

describe("parseDecimal", () => {
  it("aceita vírgula decimal e unidade colada", () => {
    expect(parseDecimal("82,4")).toBe(82.4);
    expect(parseDecimal("82.4 kg")).toBe(82.4);
    expect(parseDecimal("180 cm")).toBe(180);
    expect(parseDecimal(75)).toBe(75);
  });

  it("devolve null em vez de NaN", () => {
    expect(parseDecimal("")).toBeNull();
    expect(parseDecimal("abc")).toBeNull();
    expect(parseDecimal("-")).toBeNull();
    expect(parseDecimal(null)).toBeNull();
    expect(parseDecimal(Number.NaN)).toBeNull();
  });

  it("recusa valores fora da faixa", () => {
    expect(parseDecimalInRange("82,4", 20, 400)).toBe(82.4);
    expect(parseDecimalInRange("2000", 20, 400)).toBeNull();
    expect(parseDecimalInRange("0", 20, 400)).toBeNull();
  });
});
