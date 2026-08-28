export function formatMeasure(value: number, unit: string, digits = 1): string {
  const integer = Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-9;
  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: integer ? 0 : digits,
    maximumFractionDigits: digits,
  });
  return `${formatted} ${unit}`.trim();
}

export function formatSignedDelta(value: number, unit: string, digits = 1): string {
  const integer = Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-9;
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: integer ? 0 : digits,
    maximumFractionDigits: digits,
  });
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${abs}${unit ? ` ${unit}` : ""}`.trim();
}

export function formatPercent(value: number, digits = 1): string {
  const integer = Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-9;
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: integer ? 0 : digits,
    maximumFractionDigits: digits,
  })}%`;
}
