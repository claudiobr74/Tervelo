import { describe, expect, it } from "vitest";
import { CHECKOUT_FORBIDDEN_QUESTIONS, needsPartialReason, skippedPostWorkoutCheckout } from "./post-workout";

describe("Check-out Pós-Treino", () => {
  it("pode ser pulado sem invalidar a sessão", () => {
    const skipped = skippedPostWorkoutCheckout();
    expect(skipped.status).toBe("skipped");
  });

  it("pede motivo só quando o planejado não foi cumprido", () => {
    expect(needsPartialReason("sim")).toBe(false);
    expect(needsPartialReason("parcialmente")).toBe(true);
    expect(needsPartialReason("nao")).toBe(true);
  });

  it("não pergunta carga, reps ou séries", () => {
    expect(CHECKOUT_FORBIDDEN_QUESTIONS).toEqual([
      "Qual carga utilizou?",
      "Quantas repetições realizou?",
      "Quantas séries fez?",
    ]);
  });
});
