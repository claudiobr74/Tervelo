import { err, ok, type Result } from "../result";

export type AgeError = { code: "invalid_birth_date" } | { code: "birth_date_in_future" };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDateOnly(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function utcYmd(now: Date): { year: number; month: number; day: number } {
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  };
}

/** Idade em anos completos. Nunca persistir — deriva de `birth_date`. */
export function ageYearsFromBirthDate(
  birthDateIso: string,
  now: Date,
): Result<number, AgeError> {
  const birth = parseIsoDateOnly(birthDateIso);
  if (!birth) {
    return err({ code: "invalid_birth_date" });
  }
  const today = utcYmd(now);
  const birthYmd = {
    year: birth.getUTCFullYear(),
    month: birth.getUTCMonth() + 1,
    day: birth.getUTCDate(),
  };
  if (
    birthYmd.year > today.year ||
    (birthYmd.year === today.year && birthYmd.month > today.month) ||
    (birthYmd.year === today.year && birthYmd.month === today.month && birthYmd.day > today.day)
  ) {
    return err({ code: "birth_date_in_future" });
  }
  let age = today.year - birthYmd.year;
  if (today.month < birthYmd.month || (today.month === birthYmd.month && today.day < birthYmd.day)) {
    age -= 1;
  }
  return ok(age);
}
