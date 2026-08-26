export type LongitudinalRow = {
  id: string;
  recordedAt: Date;
  supersedesId?: string | null;
};

export const APPEND_ONLY_ENTITIES = [
  "body_measurements",
  "set_results",
  "recovery_checkins",
  "nutrition_targets",
] as const;

export type AppendOnlyEntity = (typeof APPEND_ONLY_ENTITIES)[number];

export function isAppendOnlyEntity(name: string): name is AppendOnlyEntity {
  return (APPEND_ONLY_ENTITIES as readonly string[]).includes(name);
}

/** Correção = novo registro. Métricas nunca sofrem UPDATE. */
export function canUpdateMetrics(entity: string): boolean {
  return !isAppendOnlyEntity(entity);
}

/** Remove linhas que já foram substituídas por uma correção explícita. */
export function effectiveHistory<T extends LongitudinalRow>(rows: readonly T[]): T[] {
  const superseded = new Set(
    rows.map((row) => row.supersedesId).filter((id): id is string => Boolean(id)),
  );
  return rows.filter((row) => !superseded.has(row.id));
}

export function latestByTime<T extends LongitudinalRow>(rows: readonly T[]): T | null {
  const effective = effectiveHistory(rows);
  if (effective.length === 0) return null;
  return effective.reduce((latest, row) =>
    row.recordedAt.getTime() > latest.recordedAt.getTime() ? row : latest,
  );
}
