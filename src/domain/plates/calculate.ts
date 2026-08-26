import { err, ok, type Result } from "../result";

export type PlateStock = {
  weightKg: number;
  quantity: number;
};

export type PlateCount = {
  weightKg: number;
  count: number;
};

export type PlateSolution = {
  barKg: number;
  targetKg: number;
  perSideKg: number;
  perSide: PlateCount[];
  totalPlates: number;
};

export type PlateError = {
  code: "invalid_input" | "target_below_bar" | "asymmetric" | "insufficient_stock" | "unreachable";
};

const GRAMS = 1000;
const INF = 1_000_000;

function toGrams(kg: number): number {
  return Math.round(kg * GRAMS);
}

function fromGrams(grams: number): number {
  return grams / GRAMS;
}

export function typicalPlateStock(): PlateStock[] {
  return [
    { weightKg: 25, quantity: 8 },
    { weightKg: 20, quantity: 8 },
    { weightKg: 15, quantity: 4 },
    { weightKg: 10, quantity: 8 },
    { weightKg: 5, quantity: 8 },
    { weightKg: 2.5, quantity: 8 },
    { weightKg: 1.25, quantity: 8 },
    { weightKg: 1, quantity: 4 },
    { weightKg: 0.5, quantity: 8 },
  ];
}

function mergeStock(stock: readonly PlateStock[]): Map<number, number> {
  const merged = new Map<number, number>();
  for (const item of stock) {
    if (!(item.weightKg > 0) || !(item.quantity > 0)) continue;
    const grams = toGrams(item.weightKg);
    merged.set(grams, (merged.get(grams) ?? 0) + Math.floor(item.quantity));
  }
  return merged;
}

/**
 * Carga total → discos por lado, simétricos, menor quantidade, inventário real.
 * Recusa carga impossível quando há inventário.
 */
export function calculatePlates(input: {
  targetKg: number;
  barKg: number;
  stock: readonly PlateStock[];
}): Result<PlateSolution, PlateError> {
  if (
    !Number.isFinite(input.targetKg) ||
    !Number.isFinite(input.barKg) ||
    input.targetKg <= 0 ||
    input.barKg < 0
  ) {
    return err({ code: "invalid_input" });
  }

  const targetGrams = toGrams(input.targetKg);
  const barGrams = toGrams(input.barKg);
  if (targetGrams < barGrams) {
    return err({ code: "target_below_bar" });
  }

  const loadGrams = targetGrams - barGrams;
  if (loadGrams === 0) {
    return ok({
      barKg: input.barKg,
      targetKg: input.targetKg,
      perSideKg: 0,
      perSide: [],
      totalPlates: 0,
    });
  }
  if (loadGrams % 2 !== 0) {
    return err({ code: "asymmetric" });
  }

  const perSideGrams = loadGrams / 2;
  const merged = mergeStock(input.stock);
  const types = [...merged.entries()]
    .map(([weightGrams, quantity]) => ({
      weightGrams,
      maxPerSide: Math.floor(quantity / 2),
    }))
    .filter((type) => type.maxPerSide > 0)
    .sort((a, b) => b.weightGrams - a.weightGrams);

  const availablePerSide = types.reduce(
    (sum, type) => sum + type.weightGrams * type.maxPerSide,
    0,
  );
  if (types.length === 0 || availablePerSide < perSideGrams) {
    return err({ code: "insufficient_stock" });
  }

  type Item = { weightGrams: number };
  const items: Item[] = [];
  for (const type of types) {
    for (let copy = 0; copy < type.maxPerSide; copy += 1) {
      items.push({ weightGrams: type.weightGrams });
    }
  }

  const cap = perSideGrams;
  const dp = new Int32Array(cap + 1).fill(INF);
  const parentWeight = new Int32Array(cap + 1).fill(-1);
  const parentItem = new Int32Array(cap + 1).fill(-1);
  dp[0] = 0;

  for (let i = 0; i < items.length; i += 1) {
    const weight = items[i].weightGrams;
    for (let x = cap; x >= weight; x -= 1) {
      const candidate = dp[x - weight] + 1;
      if (candidate < dp[x]) {
        dp[x] = candidate;
        parentWeight[x] = x - weight;
        parentItem[x] = i;
      }
    }
  }

  if (dp[cap] >= INF) {
    return err({ code: "unreachable" });
  }

  const counts = new Map<number, number>();
  let cursor = cap;
  const used = new Set<number>();
  while (cursor > 0) {
    const itemIndex = parentItem[cursor];
    if (itemIndex < 0 || used.has(itemIndex)) {
      return err({ code: "unreachable" });
    }
    used.add(itemIndex);
    const weight = items[itemIndex].weightGrams;
    counts.set(weight, (counts.get(weight) ?? 0) + 1);
    cursor = parentWeight[cursor];
  }

  const perSide = [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([weightGrams, count]) => ({
      weightKg: fromGrams(weightGrams),
      count,
    }));

  const totalPlates = perSide.reduce((sum, plate) => sum + plate.count, 0) * 2;

  return ok({
    barKg: input.barKg,
    targetKg: input.targetKg,
    perSideKg: fromGrams(perSideGrams),
    perSide,
    totalPlates,
  });
}

export function platesSumKg(plates: readonly PlateCount[]): number {
  return plates.reduce((sum, plate) => sum + plate.weightKg * plate.count, 0);
}

function assemblyKey(solution: PlateSolution): string {
  return solution.perSide.map((plate) => `${plate.weightKg}x${plate.count}`).join("|");
}

function sameAssembly(a: PlateSolution, b: PlateSolution): boolean {
  return assemblyKey(a) === assemblyKey(b);
}

/** Outras montagens simétricas, depois da de menor quantidade de discos. */
export function listPlateAssemblies(
  input: {
    targetKg: number;
    barKg: number;
    stock: readonly PlateStock[];
  },
  limit = 3,
): Result<PlateSolution[], PlateError> {
  const primary = calculatePlates(input);
  if (!primary.ok) return primary;
  const found: PlateSolution[] = [primary.value];

  for (const used of primary.value.perSide) {
    if (found.length >= limit) break;
    const reduced = input.stock.map((item) => {
      if (item.weightKg !== used.weightKg) return item;
      const maxPair = Math.max(0, used.count - 1) * 2;
      return { ...item, quantity: Math.min(item.quantity, maxPair) };
    });
    const alternative = calculatePlates({ ...input, stock: reduced });
    if (alternative.ok && !found.some((item) => sameAssembly(item, alternative.value))) {
      found.push(alternative.value);
    }
  }

  return ok(found);
}

export function nearestPlateLoads(input: {
  targetKg: number;
  barKg: number;
  stock: readonly PlateStock[];
}): { below: PlateSolution | null; above: PlateSolution | null } {
  let below: PlateSolution | null = null;
  let above: PlateSolution | null = null;
  const targetGrams = toGrams(input.targetKg);
  const minGrams = Math.max(toGrams(input.barKg), targetGrams - 40 * GRAMS);
  const maxGrams = targetGrams + 40 * GRAMS;
  const step = 500;
  for (let grams = Math.ceil(minGrams / step) * step; grams <= maxGrams; grams += step) {
    if (grams === targetGrams) continue;
    const result = calculatePlates({ ...input, targetKg: fromGrams(grams) });
    if (!result.ok) continue;
    if (grams < targetGrams) {
      below = result.value;
    } else {
      above = result.value;
      break;
    }
  }
  return { below, above };
}

export function plateColorClass(weightKg: number): string {
  if (weightKg >= 20) return "bg-error";
  if (weightKg >= 15) return "bg-brand";
  if (weightKg >= 10) return "bg-info";
  if (weightKg >= 5) return "bg-success";
  return "bg-border-strong";
}
