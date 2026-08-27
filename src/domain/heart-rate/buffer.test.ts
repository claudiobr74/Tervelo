import { describe, expect, it } from "vitest";
import {
  enqueueHeartRateSamples,
  flushHeartRateQueue,
  pendingHeartRateCount,
  shouldFlush,
} from "./buffer";
import type { BufferedHeartRateSample } from "./buffer";

function row(
  id: string,
  status: BufferedHeartRateSample["status"] = "pending",
): BufferedHeartRateSample {
  return {
    id,
    clientMutationId: id,
    recordedAt: "2026-08-26T10:00:00.000Z",
    bpm: 110,
    source: "web_bluetooth",
    isValid: true,
    quality: "good",
    qualityReason: null,
    exerciseId: null,
    setId: null,
    status,
  };
}

describe("buffer de frequência cardíaca", () => {
  it("é idempotente no clientMutationId", () => {
    const once = enqueueHeartRateSamples([], [row("a")]);
    const twice = enqueueHeartRateSamples(once, [row("a"), row("b")]);
    expect(twice.map((item) => item.clientMutationId)).toEqual(["a", "b"]);
  });

  it("marca lote como synced e não reenvia", async () => {
    const sent: string[] = [];
    const flushed = await flushHeartRateQueue([row("a"), row("b")], async (batch) => {
      sent.push(...batch.map((item) => item.clientMutationId));
    });
    expect(sent).toEqual(["a", "b"]);
    expect(flushed.every((item) => item.status === "synced")).toBe(true);
    const again = await flushHeartRateQueue(flushed, async () => {
      throw new Error("não deveria enviar");
    });
    expect(again.every((item) => item.status === "synced")).toBe(true);
  });

  it("mantém pending após falha e conta para sincronização", async () => {
    const flushed = await flushHeartRateQueue([row("a")], async () => {
      throw new Error("offline");
    });
    expect(flushed[0].status).toBe("failed");
    expect(pendingHeartRateCount(flushed)).toBe(1);
  });

  it("faz flush periódico, na troca de exercício e no fim da sessão", () => {
    expect(
      shouldFlush({ pendingCount: 3, trigger: "interval", lastFlushAtMs: 0, nowMs: 16_000 }),
    ).toBe(true);
    expect(
      shouldFlush({ pendingCount: 3, trigger: "interval", lastFlushAtMs: 10_000, nowMs: 12_000 }),
    ).toBe(false);
    expect(
      shouldFlush({
        pendingCount: 1,
        trigger: "exercise_change",
        lastFlushAtMs: 10_000,
        nowMs: 10_100,
      }),
    ).toBe(true);
    expect(
      shouldFlush({
        pendingCount: 1,
        trigger: "session_end",
        lastFlushAtMs: 10_000,
        nowMs: 10_100,
      }),
    ).toBe(true);
    expect(
      shouldFlush({ pendingCount: 0, trigger: "session_end", lastFlushAtMs: null, nowMs: 1 }),
    ).toBe(false);
  });
});
