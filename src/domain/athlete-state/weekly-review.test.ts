import { describe, expect, it } from "vitest";
import { buildAthleteState } from "./engine";
import { defaultAthleteStateInput } from "./gates";
import { buildWeeklyReview, recordDecisionOutcome, selectAgentsForWeeklyReview } from "./weekly-review";

describe("Revisão Semanal do Coach", () => {
  it("caso 7: boa semana → manter plano", () => {
    const athleteState = buildAthleteState(
      defaultAthleteStateInput({ recentPerformance: "progressing" }),
    );
    const review = buildWeeklyReview({
      athleteState,
      previousWeekState: { estadoGeral: "ESTAVEL" },
      blockTrend: "progressing",
      sessionsPlanned: 4,
      sessionsCompleted: 4,
      progressedExerciseCount: 3,
      nutritionOnPlan: true,
      bodyRecompositionFavorable: false,
      heartRateEnabled: false,
      heartRateRelevantCopy: null,
      trainingArchitectAllowsDeload: false,
      newBodyMeasurementThisWeek: false,
      nutritionStable: true,
    });
    expect(review.decisao).toBe("SEM_MUDANCA");
    expect(review.manterTreino).toBe(true);
    expect(review.visaoGeral).toMatch(/Não há justificativa/);
    expect(review.nutricao).not.toMatch(/Proteína média:/);
  });

  it("caso 4: revisar nutrição antes de reduzir treino", () => {
    const athleteState = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "declining",
        decliningSessionCount: 3,
        weightTrend: "falling_faster_than_plan",
        energyIntakeVsTarget: "below",
        nutritionAdherence: "below",
      }),
    );
    const review = buildWeeklyReview({
      athleteState,
      previousWeekState: { estadoGeral: "ESTAVEL" },
      blockTrend: "declining",
      sessionsPlanned: 4,
      sessionsCompleted: 4,
      progressedExerciseCount: 0,
      nutritionOnPlan: false,
      bodyRecompositionFavorable: false,
      heartRateEnabled: false,
      heartRateRelevantCopy: null,
      trainingArchitectAllowsDeload: true,
      newBodyMeasurementThisWeek: false,
      nutritionStable: false,
    });
    expect(review.revisarNutricao).toBe(true);
    expect(review.manterTreino).toBe(true);
    expect(review.decisao).not.toBe("ALTERACAO_DO_PROGRAMA");
    expect(review.agentesInvocados).toContain("nutrition");
  });

  it("caso 3: recomposição favorável → manter treino e nutrição", () => {
    const athleteState = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "progressing",
        weightTrend: "stable",
        waistTrend: "decreasing",
        skinfoldTrend: "decreasing",
      }),
    );
    const review = buildWeeklyReview({
      athleteState,
      previousWeekState: null,
      blockTrend: "progressing",
      sessionsPlanned: 4,
      sessionsCompleted: 4,
      progressedExerciseCount: 3,
      nutritionOnPlan: true,
      bodyRecompositionFavorable: true,
      heartRateEnabled: false,
      heartRateRelevantCopy: null,
      trainingArchitectAllowsDeload: false,
      newBodyMeasurementThisWeek: true,
      nutritionStable: true,
    });
    expect(review.manterTreino).toBe(true);
    expect(review.revisarNutricao).toBe(false);
    expect(review.visaoGeral).toMatch(/cintura e dobras/);
  });

  it("caso 2: recuperação reduzida só sugere deload se o arquiteto permitir", () => {
    const athleteState = buildAthleteState(
      defaultAthleteStateInput({
        sleepVsHabitual: "below",
        energyVsHabitual: "below",
        muscleRecoveryVsHabitual: "below",
        recoveryVsHabitual: "below",
        recentPerformance: "declining",
        decliningSessionCount: 3,
        perceivedExertionTrend: "rising",
      }),
    );
    const review = buildWeeklyReview({
      athleteState,
      previousWeekState: { estadoGeral: "RECUPERACAO_REDUZIDA" },
      blockTrend: "declining",
      sessionsPlanned: 4,
      sessionsCompleted: 4,
      progressedExerciseCount: 0,
      nutritionOnPlan: true,
      bodyRecompositionFavorable: false,
      heartRateEnabled: false,
      heartRateRelevantCopy: null,
      trainingArchitectAllowsDeload: true,
      newBodyMeasurementThisWeek: false,
      nutritionStable: true,
    });
    expect(review.considerarSemanaRecuperacao).toBe(true);
    expect(review.decisao).toBe("AJUSTE_DA_SEMANA");
  });

  it("poucos dados: aprendendo padrão → manter", () => {
    const athleteState = buildAthleteState(
      defaultAthleteStateInput({ weeksOfHistory: 1, sessionsCompleted: 2, dataQuality: "BAIXA" }),
    );
    const review = buildWeeklyReview({
      athleteState,
      previousWeekState: null,
      blockTrend: "unknown",
      sessionsPlanned: 4,
      sessionsCompleted: 2,
      progressedExerciseCount: 0,
      nutritionOnPlan: null,
      bodyRecompositionFavorable: false,
      heartRateEnabled: false,
      heartRateRelevantCopy: null,
      trainingArchitectAllowsDeload: false,
      newBodyMeasurementThisWeek: false,
      nutritionStable: true,
    });
    expect(review.decisao).toBe("SEM_MUDANCA");
    expect(review.titulo).toBe("Aprendendo seu padrão");
  });

  it("não chama analista de composição sem medida nova", () => {
    const athleteState = buildAthleteState(defaultAthleteStateInput());
    const agents = selectAgentsForWeeklyReview({
      athleteState,
      previousWeekState: null,
      blockTrend: "stable",
      sessionsPlanned: 4,
      sessionsCompleted: 4,
      progressedExerciseCount: 1,
      nutritionOnPlan: true,
      bodyRecompositionFavorable: false,
      heartRateEnabled: false,
      heartRateRelevantCopy: null,
      trainingArchitectAllowsDeload: false,
      newBodyMeasurementThisWeek: false,
      nutritionStable: true,
    });
    expect(agents).not.toContain("body_composition");
  });

  it("associa decisão ao que aconteceu depois sem afirmar causalidade", () => {
    const outcome = recordDecisionOutcome({
      originalDecision: "AJUSTE_DA_SEMANA",
      followUpPeriodStart: "2026-08-19",
      followUpPeriodEnd: "2026-08-26",
      subsequentPerformance: "improved",
      subsequentRecovery: "improved",
      subsequentAdherence: "high",
    });
    expect(outcome.assertCausality).toBe(false);
  });

  it("frequência cardíaca só aparece quando há copy relevante", () => {
    const athleteState = buildAthleteState(defaultAthleteStateInput({ heartRateEnabled: true }));
    const review = buildWeeklyReview({
      athleteState,
      previousWeekState: null,
      blockTrend: "stable",
      sessionsPlanned: 4,
      sessionsCompleted: 4,
      progressedExerciseCount: 2,
      nutritionOnPlan: true,
      bodyRecompositionFavorable: false,
      heartRateEnabled: true,
      heartRateRelevantCopy:
        "Sua recuperação cardíaca entre séries permaneceu semelhante às sessões comparáveis anteriores.",
      trainingArchitectAllowsDeload: false,
      newBodyMeasurementThisWeek: false,
      nutritionStable: true,
    });
    expect(review.frequenciaCardiaca).toMatch(/recuperação cardíaca/);
  });
});
