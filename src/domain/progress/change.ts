/** Variação percentual entre dois pontos. IA e UI usam janela, não um único treino. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}
