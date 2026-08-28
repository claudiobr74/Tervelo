import { describe, expect, it } from "vitest";
import { shouldPromptPreWorkoutCheckin } from "./gates";

describe("shouldPromptPreWorkoutCheckin", () => {
  it("pergunta quando a preferência está ligada e ainda não houve check-in", () => {
    expect(
      shouldPromptPreWorkoutCheckin({
        preferenceEnabled: true,
        alreadyCheckedIn: false,
        sessionAlreadyActive: false,
      }),
    ).toBe(true);
  });

  it("não interrompe um treino já em andamento", () => {
    expect(
      shouldPromptPreWorkoutCheckin({
        preferenceEnabled: true,
        alreadyCheckedIn: false,
        sessionAlreadyActive: true,
      }),
    ).toBe(false);
  });

  it("não repete o check-in do dia", () => {
    expect(
      shouldPromptPreWorkoutCheckin({
        preferenceEnabled: true,
        alreadyCheckedIn: true,
        sessionAlreadyActive: false,
      }),
    ).toBe(false);
  });

  it("respeita quem desligou a preferência", () => {
    expect(
      shouldPromptPreWorkoutCheckin({
        preferenceEnabled: false,
        alreadyCheckedIn: false,
        sessionAlreadyActive: false,
      }),
    ).toBe(false);
  });
});
