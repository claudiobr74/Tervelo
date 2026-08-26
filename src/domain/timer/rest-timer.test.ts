import { describe, expect, it } from "vitest";
import {
  adjustRestTimer,
  pauseRestTimer,
  remainingSeconds,
  restartRestTimer,
  resumeRestTimer,
  skipRestTimer,
  startRestTimer,
  tickRestTimer,
} from "./rest-timer";

const t0 = new Date("2026-08-26T12:00:00.000Z");
const plus = (seconds: number) => new Date(t0.getTime() + seconds * 1000);

describe("timer de descanso", () => {
  it("restante vem de expected_end_at menos agora", () => {
    const timer = startRestTimer(t0, 90);
    expect(remainingSeconds(timer, plus(0))).toBe(90);
    expect(remainingSeconds(timer, plus(45))).toBe(45);
    expect(remainingSeconds(timer, plus(90))).toBe(0);
  });

  it("pausa congela o restante e retomar reconstrói expected_end_at", () => {
    const running = startRestTimer(t0, 60);
    const paused = pauseRestTimer(running, plus(20));
    expect(paused.status).toBe("paused");
    expect(remainingSeconds(paused, plus(1000))).toBe(40);
    const resumed = resumeRestTimer(paused, plus(100));
    expect(resumed.status).toBe("running");
    expect(remainingSeconds(resumed, plus(100))).toBe(40);
    expect(remainingSeconds(resumed, plus(140))).toBe(0);
  });

  it("ajustes −15 / +15 / +30", () => {
    const timer = startRestTimer(t0, 90);
    expect(remainingSeconds(adjustRestTimer(timer, t0, -15), t0)).toBe(75);
    expect(remainingSeconds(adjustRestTimer(timer, t0, 15), t0)).toBe(105);
    expect(remainingSeconds(adjustRestTimer(timer, t0, 30), t0)).toBe(120);
  });

  it("−15 até zero completa o timer", () => {
    const timer = startRestTimer(t0, 10);
    const done = adjustRestTimer(timer, t0, -15);
    expect(done.status).toBe("completed");
    expect(remainingSeconds(done, t0)).toBe(0);
  });

  it("reiniciar volta à duração original; pular zera", () => {
    const timer = startRestTimer(t0, 45);
    const later = adjustRestTimer(timer, plus(10), -15);
    const restarted = restartRestTimer(later, plus(20));
    expect(remainingSeconds(restarted, plus(20))).toBe(45);
    const skipped = skipRestTimer(timer, plus(5));
    expect(skipped.status).toBe("skipped");
    expect(remainingSeconds(skipped, plus(5))).toBe(0);
  });

  it("tick marca completed quando o relógio chega no fim", () => {
    const timer = startRestTimer(t0, 10);
    expect(tickRestTimer(timer, plus(9)).status).toBe("running");
    expect(tickRestTimer(timer, plus(10)).status).toBe("completed");
  });
});
