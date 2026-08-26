import { describe, expect, it } from "vitest";
import { ageYearsFromBirthDate } from "./age";

const noonUtc = (iso: string) => new Date(`${iso}T12:00:00.000Z`);

describe("idade derivada", () => {
  it("calcula anos completos antes do aniversário", () => {
    const result = ageYearsFromBirthDate("1990-08-27", noonUtc("2026-08-26"));
    expect(result).toEqual({ ok: true, value: 35 });
  });

  it("completa o ano no dia do aniversário", () => {
    const result = ageYearsFromBirthDate("1990-08-26", noonUtc("2026-08-26"));
    expect(result).toEqual({ ok: true, value: 36 });
  });

  it("rejeita data inválida", () => {
    expect(ageYearsFromBirthDate("1990-13-01", noonUtc("2026-08-26")).ok).toBe(false);
    expect(ageYearsFromBirthDate("não-é-data", noonUtc("2026-08-26")).ok).toBe(false);
  });

  it("rejeita nascimento no futuro", () => {
    const result = ageYearsFromBirthDate("2026-08-27", noonUtc("2026-08-26"));
    expect(result).toEqual({ ok: false, error: { code: "birth_date_in_future" } });
  });
});
