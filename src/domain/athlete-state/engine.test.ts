import { describe, expect, it } from "vitest";
import { buildAthleteState } from "./engine";
import { defaultAthleteStateInput } from "./gates";
import { overallStateCopy } from "./labels";
import { interpretMissingCheckin, skippedPreWorkoutCheckin } from "./pre-workout";

describe("Motor de Estado do Atleta — casos de referência", () => {
  it("caso 1: uma noite ruim com histórico normal → manter", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        isolatedBadNight: true,
        sleepVsHabitual: "below",
        energyVsHabitual: "normal",
        recoveryVsHabitual: "normal",
        recentPerformance: "stable",
      }),
    );
    expect(state.estadoGeral).toBe("ESTAVEL");
    expect(state.treinamento.estado).toBe("ESTAVEL");
    expect(state.motivos.some((item) => item.includes("noite"))).toBe(true);
    expect(JSON.stringify(state)).not.toMatch(/prontidão|readiness|nível de prontidão/i);
  });

  it("caso 2: sono + energia + performance em queda em múltiplas sessões → recuperação reduzida", () => {
    const state = buildAthleteState(
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
    expect(state.estadoGeral).toBe("RECUPERACAO_REDUZIDA");
    expect(overallStateCopy(state.estadoGeral)).toBe("Recuperação abaixo do habitual");
    expect(state.recuperacao.estado).toBe("ABAIXO_DO_HABITUAL");
  });

  it("caso 3: peso estável + cintura e dobras caindo + performance melhorando → manter", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "progressing",
        weightTrend: "stable",
        waistTrend: "decreasing",
        skinfoldTrend: "decreasing",
      }),
    );
    expect(state.estadoGeral).toBe("PROGREDINDO");
    expect(state.composicaoCorporal.estado).toBe("DENTRO_DO_OBJETIVO");
    expect(state.nutricao.estado).toBe("DENTRO_DO_PLANEJADO");
  });

  it("caso 4: performance caindo + peso rápido + ingestão baixa → revisar nutrição", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "declining",
        decliningSessionCount: 3,
        weightTrend: "falling_faster_than_plan",
        energyIntakeVsTarget: "below",
        nutritionAdherence: "below",
      }),
    );
    expect(state.estadoGeral).toBe("REVISAO_NUTRICIONAL_NECESSARIA");
    expect(state.alertas).toContain("revisar_nutricao_antes_de_reduzir_treino");
    expect(state.nutricao.estado).toBe("ABAIXO_DO_PLANEJADO");
  });

  it("caso 6: aluno novo → aprendendo seu padrão", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        weeksOfHistory: 1,
        sessionsCompleted: 3,
        sessionsPlanned: 4,
        dataQuality: "BAIXA",
      }),
    );
    expect(state.estadoGeral).toBe("CONSTRUINDO_REFERENCIA_INDIVIDUAL");
    expect(overallStateCopy(state.estadoGeral)).toBe("Aprendendo seu padrão");
  });

  it("caso 7: boa progressão + recuperação + aderência → progredindo", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "progressing",
        recoveryVsHabitual: "normal",
        sessionsCompleted: 16,
        sessionsPlanned: 16,
      }),
    );
    expect(state.estadoGeral).toBe("PROGREDINDO");
    expect(state.aderencia.estado).toBe("ALTA");
  });

  it("caso 8: uma sessão ruim não é estagnação", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "declining",
        decliningSessionCount: 1,
        singleBadSession: true,
      }),
    );
    expect(state.estadoGeral).not.toBe("POSSIVEL_ESTAGNACAO");
    expect(state.motivos.some((item) => item.includes("isolada"))).toBe(true);
  });

  it("caso 9: frequência cardíaca isolada + performance normal → não alterar treino", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        heartRateEnabled: true,
        heartRateVsHabitual: "changed",
        recentPerformance: "stable",
      }),
    );
    expect(state.estadoGeral).toBe("ESTAVEL");
    expect(state.respostaCardiaca.habilitada).toBe(true);
    expect(state.respostaCardiaca.estado).toBe("ALTERADA");
    expect(state.motivos.some((item) => item.includes("frequência cardíaca isolada"))).toBe(true);
  });

  it("caso 10: check-in ausente → desconhecido + reduzir confiança", () => {
    const missing = interpretMissingCheckin(skippedPreWorkoutCheckin());
    expect(missing.acuteData).toBe("unknown");
    expect(missing.treatAsNormalRecovery).toBe(false);
    expect(missing.reduceConfidence).toBe(true);

    const state = buildAthleteState(
      defaultAthleteStateInput({
        checkinPresent: false,
        recoveryVsHabitual: "unknown",
        dataQuality: "MODERADA",
      }),
    );
    expect(state.dadosAusentes).toContain("checkin_pre_treino");
    expect(state.recuperacao.estado).toBe("INDEFINIDO");
    expect(["MODERADA", "BAIXA", "INSUFICIENTE"]).toContain(state.treinamento.confianca);
  });

  it("não comprime o estado em um único score 0–100", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        recentPerformance: "progressing",
        recoveryVsHabitual: "below",
        nutritionAdherence: "on_plan",
      }),
    );
    expect(state.treinamento.estado).toBe("PROGREDINDO");
    expect(state.nutricao.estado).toBe("DENTRO_DO_PLANEJADO");
    expect(state.recuperacao.estado).toBe("ABAIXO_DO_HABITUAL");
    expect(String(state.estadoGeral)).not.toMatch(/^\d+$/);
  });

  it("dados insuficientes quando quase não há sessões", () => {
    const state = buildAthleteState(
      defaultAthleteStateInput({
        weeksOfHistory: 0,
        sessionsCompleted: 0,
        sessionsPlanned: 4,
        dataQuality: "INSUFICIENTE",
      }),
    );
    expect(state.estadoGeral).toBe("DADOS_INSUFICIENTES");
  });
});
