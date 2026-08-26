import type { HeartRateSample } from "./types";

export type BufferedHeartRateSample = HeartRateSample & {
  clientMutationId: string;
  status: "pending" | "synced" | "failed";
};

export type HeartRateFlushTrigger = "interval" | "exercise_change" | "session_end" | "online";

export function enqueueHeartRateSamples(
  queue: BufferedHeartRateSample[],
  incoming: BufferedHeartRateSample[],
): BufferedHeartRateSample[] {
  const seen = new Set(queue.map((row) => row.clientMutationId));
  const next = [...queue];
  for (const sample of incoming) {
    if (seen.has(sample.clientMutationId)) continue;
    seen.add(sample.clientMutationId);
    next.push(sample);
  }
  return next;
}

export async function flushHeartRateQueue(
  queue: BufferedHeartRateSample[],
  send: (batch: BufferedHeartRateSample[]) => Promise<void>,
  batchSize = 40,
): Promise<BufferedHeartRateSample[]> {
  const pending = queue.filter((row) => row.status === "pending" || row.status === "failed");
  if (pending.length === 0) return queue;
  const byId = new Map(queue.map((row) => [row.clientMutationId, row]));
  for (let index = 0; index < pending.length; index += batchSize) {
    const batch = pending.slice(index, index + batchSize);
    try {
      await send(batch);
      for (const item of batch) {
        byId.set(item.clientMutationId, { ...item, status: "synced" });
      }
    } catch {
      for (const item of batch) {
        byId.set(item.clientMutationId, { ...item, status: "failed" });
      }
    }
  }
  return queue.map((row) => byId.get(row.clientMutationId) ?? row);
}

export function pendingHeartRateCount(queue: BufferedHeartRateSample[]): number {
  return queue.filter((row) => row.status === "pending" || row.status === "failed").length;
}

export function shouldFlush(input: {
  pendingCount: number;
  trigger: HeartRateFlushTrigger;
  lastFlushAtMs: number | null;
  nowMs: number;
  intervalMs?: number;
}): boolean {
  if (input.pendingCount <= 0) return false;
  if (input.trigger === "exercise_change" || input.trigger === "session_end" || input.trigger === "online") {
    return true;
  }
  const interval = input.intervalMs ?? 15_000;
  if (input.lastFlushAtMs === null) return true;
  return input.nowMs - input.lastFlushAtMs >= interval;
}
