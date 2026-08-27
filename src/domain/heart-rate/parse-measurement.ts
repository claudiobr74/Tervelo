import type { HeartRateMeasurement } from "./types";

const FLAG_HR_UINT16 = 0x01;
const FLAG_SENSOR_CONTACT_SUPPORTED = 0x04;
const FLAG_SENSOR_CONTACT_DETECTED = 0x02;
const FLAG_ENERGY_EXPENDED = 0x08;
const FLAG_RR_INTERVALS = 0x10;

export type ParseHeartRateResult =
  { ok: true; value: HeartRateMeasurement } | { ok: false; reason: string };

function readUint16Le(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}

function sensorContact(flags: number): boolean | null {
  if ((flags & FLAG_SENSOR_CONTACT_SUPPORTED) === 0) return null;
  return (flags & FLAG_SENSOR_CONTACT_DETECTED) !== 0;
}

/**
 * Interpreta o pacote GATT Heart Rate Measurement (0x2A37).
 * Não usa modelo de linguagem. Campos opcionais ausentes ficam vazios/nulos.
 */
export function parseHeartRateMeasurement(dataView: DataView): ParseHeartRateResult {
  if (dataView.byteLength < 2) {
    return { ok: false, reason: "pacote menor que o mínimo (flags + bpm)" };
  }

  const flags = dataView.getUint8(0);
  const uint16 = (flags & FLAG_HR_UINT16) !== 0;
  let offset = 1;

  if (uint16 && dataView.byteLength < offset + 2) {
    return { ok: false, reason: "pacote truncado: bpm em 16 bits" };
  }
  if (!uint16 && dataView.byteLength < offset + 1) {
    return { ok: false, reason: "pacote truncado: bpm em 8 bits" };
  }

  const bpm = uint16 ? readUint16Le(dataView, offset) : dataView.getUint8(offset);
  offset += uint16 ? 2 : 1;

  let energyExpended: number | null = null;
  if ((flags & FLAG_ENERGY_EXPENDED) !== 0) {
    if (dataView.byteLength < offset + 2) {
      return { ok: false, reason: "pacote truncado: energia gasta" };
    }
    energyExpended = readUint16Le(dataView, offset);
    offset += 2;
  }

  const rrIntervals: number[] = [];
  if ((flags & FLAG_RR_INTERVALS) !== 0) {
    while (offset + 2 <= dataView.byteLength) {
      const raw = readUint16Le(dataView, offset);
      rrIntervals.push(raw / 1024);
      offset += 2;
    }
    if (offset < dataView.byteLength) {
      return { ok: false, reason: "intervalo RR truncado" };
    }
  }

  if (!Number.isFinite(bpm) || bpm < 0) {
    return { ok: false, reason: "bpm inválido" };
  }

  return {
    ok: true,
    value: {
      bpm,
      sensorContactDetected: sensorContact(flags),
      rrIntervals,
      energyExpended,
      rawFlags: flags,
    },
  };
}

export function sampleValidity(
  bpm: number,
  sensorContactDetected: boolean | null,
): {
  isValid: boolean;
  quality: "good" | "degraded" | "poor";
  qualityReason: string | null;
} {
  if (sensorContactDetected === false) {
    return { isValid: false, quality: "poor", qualityReason: "contato do sensor ausente" };
  }
  if (!Number.isFinite(bpm) || bpm < 20 || bpm > 250) {
    return { isValid: false, quality: "poor", qualityReason: "bpm fora da faixa fisiológica útil" };
  }
  if (bpm < 30 || bpm > 220) {
    return { isValid: true, quality: "degraded", qualityReason: "bpm extremo" };
  }
  return { isValid: true, quality: "good", qualityReason: null };
}
