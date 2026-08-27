import { describe, expect, it } from "vitest";
import { emptyNutritionContext } from "./nutrition-context";
import {
  COACH_SUGGESTIONS,
  coachProposalFeedback,
  coachReplyForPrompt,
  emptyCoachFacts,
  previewCoachFacts,
  requireKnownFacts,
} from "./coach-preview";

describe("coach preview", () => {
  it("recusa fabricar carga quando o fato está UNKNOWN", () => {
    const facts = { ...previewCoachFacts, benchPressKg: null };
    const check = requireKnownFacts(facts, [
      "benchPressKg",
      "proposedBenchPressKg",
      "repetitionsInReserve",
    ]);
    expect(check.ok).toBe(false);
    if (!check.ok) {
      expect(check.unknown).toContain("benchPressKg");
    }
    const reply = coachReplyForPrompt("Como está minha evolução?", facts);
    expect(reply.body).toContain("UNKNOWN");
    expect(reply.body).toContain("carga registrada no supino");
    expect(reply.body).not.toContain("benchPressKg");
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
    expect(reply.body).not.toContain("agachamento");
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

  it("só cita resposta cardíaca quando HEART_RATE_CONTEXT existe", () => {
    const without = coachReplyForPrompt("Como está minha evolução?", previewCoachFacts);
    expect(without.body).not.toContain("base isolada na frequência cardíaca");

    const withHr = coachReplyForPrompt("Como está minha evolução?", {
      ...previewCoachFacts,
      heartRate: {
        enabled: true,
        session: {
          averageBpm: 118,
          maximumBpm: 157,
          minimumBpm: 90,
          coverage: 0.94,
          sampleCount: 400,
        },
        recovery: { median60Seconds: 29, trend: "STABLE" },
        comparability: { sameDevice: true, comparableSessions: 4 },
        quality: "GOOD",
      },
    });
    expect(withHr.body).toContain("resposta ao treinamento permanece consistente");
    expect(withHr.body).not.toMatch(/overtraining/i);

    const unknownTrend = coachReplyForPrompt("Como está minha evolução?", {
      ...previewCoachFacts,
      heartRate: {
        enabled: true,
        session: {
          averageBpm: 118,
          maximumBpm: 157,
          minimumBpm: 90,
          coverage: 0.94,
          sampleCount: 400,
        },
        recovery: { median60Seconds: null, trend: "UNKNOWN" },
        comparability: { sameDevice: true, comparableSessions: 4 },
        quality: "GOOD",
      },
    });
    expect(unknownTrend.body).not.toContain("permanece consistente");
  });

  it("não inventa plano nem mudança de treino sem fato", () => {
    expect(coachReplyForPrompt("Posso substituir um exercício?", emptyCoachFacts).body).toContain(
      "Não há sessão prescrita",
    );
    expect(coachReplyForPrompt("Por que meu treino mudou?", emptyCoachFacts).body).toContain(
      "Nada no recorte de hoje indica que o treino tenha mudado",
    );
    const fromCheckin = coachReplyForPrompt("Por que meu treino mudou?", {
      ...emptyCoachFacts,
      sessionChangedToday: true,
      sessionChangeReason: "Você tem cerca de 40 minutos, abaixo do tempo planejado.",
    });
    expect(fromCheckin.body).toContain("40 minutos");
    expect(fromCheckin.sections?.interpretacao).toContain("só para a sessão de hoje");
    expect(
      coachReplyForPrompt("Por que meu treino mudou?", {
        ...emptyCoachFacts,
        sessionChangedToday: true,
        sessionChangeReason: null,
      }).body,
    ).toContain("recuperação de membros inferiores");
  });
});
