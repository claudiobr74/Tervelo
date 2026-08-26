import { describe, expect, it } from "vitest";
import { emptyNutritionContext } from "./nutrition-context";
import {
  COACH_SUGGESTIONS,
  coachProposalFeedback,
  coachReplyForPrompt,
  previewCoachFacts,
  requireKnownFacts,
} from "./coach-preview";

describe("coach preview", () => {
  it("recusa fabricar carga quando o fato está UNKNOWN", () => {
    const facts = { ...previewCoachFacts, benchPressKg: null };
    const check = requireKnownFacts(facts, ["benchPressKg", "proposedBenchPressKg", "repetitionsInReserve"]);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.unknown).toContain("benchPressKg");
    }
    const reply = coachReplyForPrompt("Como está minha evolução?", facts);
    expect(reply.body).toContain("UNKNOWN");
    expect(reply.body).toContain("benchPressKg");
    expect(reply.sections).toBeUndefined();
  });

  it("responde evolução com fatos conhecidos e nutrição UNKNOWN", () => {
    const reply = coachReplyForPrompt("Como está minha evolução?", previewCoachFacts);
    expect(reply.body).toContain("repetições em reserva");
    expect(reply.body).not.toMatch(/\bRIR\b/);
    expect(reply.sections?.observacao).toContain("80");
    expect(reply.sections?.recomendacao).toContain("82");
    expect(reply.sections?.papelDaNutricao).toContain("UNKNOWN");
    expect(reply.sections?.proximaReavaliacao).toBeTruthy();
  });

  it("explica a mudança de treino sem inventar déficit calórico", () => {
    const reply = coachReplyForPrompt("Por que meu treino mudou?", previewCoachFacts);
    expect(reply.body).toContain("recuperação de membros inferiores");
    expect(reply.sections?.papelDaNutricao).toContain("UNKNOWN");
    expect(reply.sections?.papelDaNutricao).not.toMatch(/déficit/i);
  });

  it("usa adesão nutricional quando o fato existe", () => {
    const nutrition = emptyNutritionContext();
    nutrition.behavior.nutritionAdherence = "alta";
    const reply = coachReplyForPrompt("Como está minha evolução?", {
      ...previewCoachFacts,
      nutrition,
    });
    expect(reply.sections?.papelDaNutricao).toContain("alta");
    expect(reply.sections?.papelDaNutricao).not.toContain("UNKNOWN");
  });

  it("expõe chips e feedback de aceite da proposta", () => {
    expect(COACH_SUGGESTIONS).toContain("Devo aumentar a carga?");
    expect(coachProposalFeedback("pending")).toBeNull();
    expect(coachProposalFeedback("accepted")).toContain("82 kg");
    expect(coachProposalFeedback("kept")).toContain("80 kg");
  });
});
