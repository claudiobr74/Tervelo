export type QueuedSetResult = {
  clientMutationId: string;
  userId: string;
  setId: string;
  weightKg?: number;
  reps?: number;
  repsInReserve?: number;
  methodKind: string;
  performedAt: string;
  status: "pending" | "synced" | "failed";
};

export function enqueueSetResult(
  queue: QueuedSetResult[],
  item: Omit<QueuedSetResult, "status">,
): QueuedSetResult[] {
  if (queue.some((row) => row.clientMutationId === item.clientMutationId)) {
    return queue;
  }
  return [...queue, { ...item, status: "pending" }];
}

export async function flushSetResultQueue(
  queue: QueuedSetResult[],
  send: (item: QueuedSetResult) => Promise<void>,
): Promise<QueuedSetResult[]> {
  const next = [...queue];
  for (let index = 0; index < next.length; index += 1) {
    const item = next[index];
    if (item.status !== "pending") continue;
    try {
      await send(item);
      next[index] = { ...item, status: "synced" };
    } catch {
      next[index] = { ...item, status: "failed" };
    }
  }
  return next;
}

export function pendingCount(queue: QueuedSetResult[]): number {
  return queue.filter((item) => item.status === "pending" || item.status === "failed").length;
}
