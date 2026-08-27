export type QueuedAthleteMutationKind =
  | "pre_workout_checkin"
  | "post_workout_checkout"
  | "athlete_state_snapshot";

export type QueuedAthleteMutation = {
  clientMutationId: string;
  kind: QueuedAthleteMutationKind;
  payload: Record<string, unknown>;
  status: "pending" | "synced" | "failed";
};

export function enqueueAthleteMutation(
  queue: QueuedAthleteMutation[],
  item: Omit<QueuedAthleteMutation, "status">,
): QueuedAthleteMutation[] {
  if (queue.some((row) => row.clientMutationId === item.clientMutationId)) {
    return queue;
  }
  return [...queue, { ...item, status: "pending" }];
}

export async function flushAthleteMutationQueue(
  queue: QueuedAthleteMutation[],
  send: (item: QueuedAthleteMutation) => Promise<void>,
): Promise<QueuedAthleteMutation[]> {
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

export function pendingAthleteMutations(queue: QueuedAthleteMutation[]): number {
  return queue.filter((item) => item.status === "pending" || item.status === "failed").length;
}
