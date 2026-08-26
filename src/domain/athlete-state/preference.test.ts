import { describe, expect, it } from "vitest";
import { enqueueAthleteMutation, flushAthleteMutationQueue } from "./offline-queue";
import { parsePreWorkoutCheckinEnabled, parseWeeklyCoachReviewEnabled } from "./preference";
import { shouldCallAdvancedModel } from "./intents";

describe("preferências do trio", () => {
  it("nascem ligadas", () => {
    expect(parsePreWorkoutCheckinEnabled(null)).toBe(true);
    expect(parseWeeklyCoachReviewEnabled(undefined)).toBe(true);
    expect(parsePreWorkoutCheckinEnabled("false")).toBe(false);
  });
});

describe("fila offline idempotente", () => {
  it("não duplica client_mutation_id", async () => {
    const item = {
      clientMutationId: "11111111-1111-4111-8111-111111111111",
      kind: "pre_workout_checkin" as const,
      payload: { status: "skipped" },
    };
    const queue = enqueueAthleteMutation(enqueueAthleteMutation([], item), item);
    expect(queue).toHaveLength(1);
    const flushed = await flushAthleteMutationQueue(queue, async () => undefined);
    expect(flushed[0].status).toBe("synced");
  });
});

describe("orquestrador", () => {
  it("não chama modelo avançado após sessão se o determinístico basta", () => {
    expect(
      shouldCallAdvancedModel({
        intent: "ANALYZE_POST_WORKOUT",
        deterministicSufficient: true,
        nutritionStable: true,
        newBodyMeasurement: false,
      }),
    ).toBe(false);
  });
});
