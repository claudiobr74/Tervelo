import { describe, expect, it } from "vitest";
import { deltaInWindow, leanMassKg, meanOf, round1 } from "./composition";

const now = new Date("2026-08-26T12:00:00Z");

describe("composição corporal", () => {
  it("estima massa magra a partir do peso e da gordura", () => {
    expect(round1(leanMassKg(82.4, 16.2))).toBe(69.1);
  });

  it("calcula delta append-only na janela, sem UPDATE", () => {
    const rows = [
      {
        id: "a",
        recordedAt: new Date("2026-07-27T12:00:00Z"),
        weightKg: 82.1,
        bodyFatPercent: 16.6,
        waistCm: 85,
        rightArmCm: 38,
        rightThighCm: 60.2,
      },
      {
        id: "b",
        recordedAt: now,
        weightKg: 82.4,
        bodyFatPercent: 16.2,
        waistCm: 84,
        rightArmCm: 38.5,
        rightThighCm: 61,
      },
    ];
    expect(round1(deltaInWindow(rows, "weightKg", now, 30) ?? 0)).toBe(0.3);
    expect(round1(deltaInWindow(rows, "bodyFatPercent", now, 30) ?? 0)).toBe(-0.4);
    expect(deltaInWindow(rows, "waistCm", now, 30)).toBe(-1);
    expect(deltaInWindow(rows, "rightArmCm", now, 30)).toBe(0.5);
    expect(round1(deltaInWindow(rows, "rightThighCm", now, 30) ?? 0)).toBe(0.8);
  });

  it("usa o ponto atual mesmo se ele estiver um pouco à frente da janela", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    const rows = [
      {
        id: "a",
        recordedAt: new Date("2026-07-28T12:00:00Z"),
        weightKg: 82.1,
        waistCm: 85,
      },
      {
        id: "b",
        recordedAt: new Date("2026-08-26T12:30:00Z"),
        weightKg: 82.4,
        waistCm: 84,
      },
    ];
    expect(round1(deltaInWindow(rows, "weightKg", now, 30) ?? 0)).toBe(0.3);
    expect(deltaInWindow(rows, "waistCm", now, 30)).toBe(-1);
  });

  it("média de peso ignora pontos sem valor", () => {
    const rows = [
      { id: "a", recordedAt: now, weightKg: 82 },
      { id: "b", recordedAt: now, weightKg: 82.2 },
      { id: "c", recordedAt: now },
    ];
    expect(round1(meanOf(rows, "weightKg") ?? 0)).toBe(82.1);
  });
});
