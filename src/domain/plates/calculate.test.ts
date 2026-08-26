import { describe, expect, it } from "vitest";
import { calculatePlates, platesSumKg, typicalPlateStock } from "./calculate";

const stock = typicalPlateStock();

describe("calculadora de anilhas", () => {
  it("barra vazia quando a carga é só a barra", () => {
    const result = calculatePlates({ targetKg: 20, barKg: 20, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.perSide).toEqual([]);
      expect(result.value.totalPlates).toBe(0);
    }
  });

  it("100 kg com barra 20 kg usa a menor quantidade (2×20 kg por lado)", () => {
    const result = calculatePlates({ targetKg: 100, barKg: 20, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.perSideKg).toBe(40);
      expect(platesSumKg(result.value.perSide)).toBe(40);
      expect(result.value.totalPlates).toBe(4);
      expect(result.value.perSide).toEqual([{ weightKg: 20, count: 2 }]);
    }
  });

  it("60 kg → 20 kg por lado com um disco de 20", () => {
    const result = calculatePlates({ targetKg: 60, barKg: 20, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.perSide).toEqual([{ weightKg: 20, count: 1 }]);
    }
  });

  it("cobre discos de 0.5 a 25 kg (71 kg = 25,5 kg por lado)", () => {
    const result = calculatePlates({ targetKg: 71, barKg: 20, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(platesSumKg(result.value.perSide)).toBeCloseTo(25.5, 6);
      expect(result.value.perSide).toEqual([
        { weightKg: 25, count: 1 },
        { weightKg: 0.5, count: 1 },
      ]);
    }
  });

  it("1.25 kg entra na conta (72.5 kg total)", () => {
    const result = calculatePlates({ targetKg: 72.5, barKg: 20, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(platesSumKg(result.value.perSide)).toBeCloseTo(26.25, 6);
    }
  });

  it("recusa carga abaixo da barra", () => {
    expect(calculatePlates({ targetKg: 15, barKg: 20, stock })).toEqual({
      ok: false,
      error: { code: "target_below_bar" },
    });
  });

  it("ímpar impossível sem disco de 0.5 kg", () => {
    const noHalves = stock.filter((item) => item.weightKg !== 0.5);
    const result = calculatePlates({ targetKg: 21, barKg: 20, stock: noHalves });
    expect(result).toEqual({ ok: false, error: { code: "unreachable" } });
  });

  it("21 kg com 0.5 kg disponível: um disco de 0.5 por lado", () => {
    const result = calculatePlates({ targetKg: 21, barKg: 20, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.perSide).toEqual([{ weightKg: 0.5, count: 1 }]);
    }
  });

  it("estoque insuficiente quando não há pares", () => {
    const result = calculatePlates({
      targetKg: 100,
      barKg: 20,
      stock: [{ weightKg: 20, quantity: 1 }],
    });
    expect(result).toEqual({ ok: false, error: { code: "insufficient_stock" } });
  });

  it("estoque insuficiente quando a massa total não chega", () => {
    const result = calculatePlates({
      targetKg: 200,
      barKg: 20,
      stock: [{ weightKg: 20, quantity: 4 }],
    });
    expect(result).toEqual({ ok: false, error: { code: "insufficient_stock" } });
  });

  it("respeita o teto do inventário (só dois de 25 kg no ginásio)", () => {
    const limited = [{ weightKg: 25, quantity: 2 }, { weightKg: 10, quantity: 8 }];
    const result = calculatePlates({ targetKg: 90, barKg: 20, stock: limited });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.perSide).toEqual([
        { weightKg: 25, count: 1 },
        { weightKg: 10, count: 1 },
      ]);
    }
  });

  it("não usa mais discos do que o estoque por lado", () => {
    const result = calculatePlates({
      targetKg: 100,
      barKg: 20,
      stock: [{ weightKg: 10, quantity: 6 }],
    });
    expect(result).toEqual({ ok: false, error: { code: "insufficient_stock" } });
  });

  it("input inválido", () => {
    expect(calculatePlates({ targetKg: 0, barKg: 20, stock }).ok).toBe(false);
    expect(calculatePlates({ targetKg: Number.NaN, barKg: 20, stock }).ok).toBe(false);
  });

  it("barra técnica de 15 kg", () => {
    const result = calculatePlates({ targetKg: 55, barKg: 15, stock });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.perSideKg).toBe(20);
      expect(platesSumKg(result.value.perSide)).toBe(20);
    }
  });
});
