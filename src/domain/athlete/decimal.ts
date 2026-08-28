/**
 * Número digitado por pessoa: aceita vírgula decimal e unidade colada ("82,4 kg").
 * Devolve `null` em vez de `NaN` para que nada inválido chegue ao banco.
 */
export function parseDecimal(input: string | number | null | undefined): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string") return null;
  const cleaned = input
    .replace(",", ".")
    .replace(/[^\d.-]/g, "")
    .trim();
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Mesma leitura, recusando valores fora de uma faixa plausível. */
export function parseDecimalInRange(
  input: string | number | null | undefined,
  min: number,
  max: number,
): number | null {
  const value = parseDecimal(input);
  if (value === null) return null;
  return value >= min && value <= max ? value : null;
}
