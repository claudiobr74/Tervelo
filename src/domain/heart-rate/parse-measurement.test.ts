import { describe, expect, it } from "vitest";
import { parseHeartRateMeasurement, sampleValidity } from "./parse-measurement";

function view(bytes: number[]): DataView {
  return new DataView(Uint8Array.from(bytes).buffer);
}

describe("parseHeartRateMeasurement", () => {
  it("lê bpm em 8 bits sem campos opcionais", () => {
    const parsed = parseHeartRateMeasurement(view([0x00, 126]));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.bpm).toBe(126);
    expect(parsed.value.sensorContactDetected).toBeNull();
    expect(parsed.value.rrIntervals).toEqual([]);
    expect(parsed.value.energyExpended).toBeNull();
    expect(parsed.value.rawFlags).toBe(0);
  });

  it("lê bpm em 16 bits little-endian", () => {
    const parsed = parseHeartRateMeasurement(view([0x01, 0x2c, 0x01]));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.bpm).toBe(300);
  });

  it("detecta contato do sensor quando o flag está presente", () => {
    const detected = parseHeartRateMeasurement(view([0x06, 80]));
    expect(detected.ok).toBe(true);
    if (detected.ok) expect(detected.value.sensorContactDetected).toBe(true);

    const missing = parseHeartRateMeasurement(view([0x04, 80]));
    expect(missing.ok).toBe(true);
    if (missing.ok) expect(missing.value.sensorContactDetected).toBe(false);
  });

  it("lê energia gasta e intervalos RR quando presentes", () => {
    const parsed = parseHeartRateMeasurement(
      view([0x18, 118, 0x2a, 0x00, 0x00, 0x04, 0x00, 0x02]),
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.bpm).toBe(118);
    expect(parsed.value.energyExpended).toBe(42);
    expect(parsed.value.rrIntervals).toEqual([1024 / 1024, 512 / 1024]);
  });

  it("rejeita pacotes vazios, truncados e bpm negativo", () => {
    expect(parseHeartRateMeasurement(view([])).ok).toBe(false);
    expect(parseHeartRateMeasurement(view([0x00])).ok).toBe(false);
    expect(parseHeartRateMeasurement(view([0x01, 0x2c])).ok).toBe(false);
    expect(parseHeartRateMeasurement(view([0x08, 80])).ok).toBe(false);
  });
});

describe("sampleValidity", () => {
  it("marca contato ausente e bpm fora de faixa como inválidos", () => {
    expect(sampleValidity(0, null).isValid).toBe(false);
    expect(sampleValidity(12, null).isValid).toBe(false);
    expect(sampleValidity(300, null).isValid).toBe(false);
    expect(sampleValidity(80, false).isValid).toBe(false);
    expect(sampleValidity(118, true).isValid).toBe(true);
    expect(sampleValidity(118, true).quality).toBe("good");
  });
});
