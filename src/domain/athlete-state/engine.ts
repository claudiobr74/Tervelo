import { confidenceFromQuality } from "./data-quality";
import {
  ATHLETE_STATE_ALGORITHM_VERSION,
  DEFAULT_REFERENCE_WEEKS,
  MAX_REFERENCE_WEEKS,
  MIN_REFERENCE_WEEKS,
  type AthleteStateInput,
  type AthleteStateSnapshot,
  type BodyDomainState,
  type ConfidenceLevel,
  type HeartRateDomainState,
  type NutritionDomainState,
  type OverallAthleteState,
  type RecoveryDomainState,
  type TrainingDomainState,
} from "./types";

export function clampReferenceWeeks(weeks: number | undefined): number {
  const value = weeks ?? DEFAULT_REFERENCE_WEEKS;
  return Math.min(MAX_REFERENCE_WEEKS, Math.max(MIN_REFERENCE_WEEKS, value));
}

function trainingDomain(input: AthleteStateInput): TrainingDomainState {
  if (input.recentPerformance === "progressing") return "PROGREDINDO";
  if (input.recentPerformance === "declining" && input.decliningSessionCount >= 2) return "EM_QUEDA";
  if (input.recentPerformance === "stable" || input.singleBadSession) return "ESTAVEL";
  if (input.recentPerformance === "unknown") return "INDEFINIDO";
  return "ESTAVEL";
}

function recoveryDomain(input: AthleteStateInput): RecoveryDomainState {
  if (!input.checkinPresent && input.recoveryVsHabitual === "unknown") return "INDEFINIDO";
  const reduced =
    input.recoveryVsHabitual === "below" ||
    input.muscleRecoveryVsHabitual === "below" ||
    (input.sleepVsHabitual === "below" && input.energyVsHabitual === "below");
  if (reduced && !input.isolatedBadNight) return "ABAIXO_DO_HABITUAL";
  if (input.isolatedBadNight && input.energyVsHabitual !== "below") return "NORMAL";
  if (input.recoveryVsHabitual === "unknown") return "INDEFINIDO";
  return "NORMAL";
}

function nutritionDomain(input: AthleteStateInput): NutritionDomainState {
  if (input.nutritionAdherence === "unknown" && input.energyIntakeVsTarget === "unknown") {
    return "INDEFINIDO";
  }
  if (input.nutritionAdherence === "below" || input.energyIntakeVsTarget === "below") {
    return "ABAIXO_DO_PLANEJADO";
  }
  return "DENTRO_DO_PLANEJADO";
}

function bodyDomain(input: AthleteStateInput): BodyDomainState {
  if (
    input.weightTrend === "unknown" &&
    input.waistTrend === "unknown" &&
    input.skinfoldTrend === "unknown"
  ) {
    return "INDEFINIDO";
  }
  const recomposition =
    (input.weightTrend === "stable" || input.weightTrend === "unknown") &&
    (input.waistTrend === "decreasing" || input.skinfoldTrend === "decreasing") &&
    input.recentPerformance !== "declining";
  if (recomposition) return "DENTRO_DO_OBJETIVO";
  if (input.weightTrend === "falling_faster_than_plan") return "FORA_DO_OBJETIVO";
  return "DENTRO_DO_OBJETIVO";
}

function heartRateDomain(input: AthleteStateInput): HeartRateDomainState {
  if (!input.heartRateEnabled) return "INDEFINIDO";
  if (input.heartRateVsHabitual === "changed") return "ALTERADA";
  if (input.heartRateVsHabitual === "stable") return "ESTAVEL";
  return "INDEFINIDO";
}

function convergentRecovery(input: AthleteStateInput): boolean {
  const signals = [
    input.sleepVsHabitual === "below",
    input.energyVsHabitual === "below",
    input.muscleRecoveryVsHabitual === "below" || input.recoveryVsHabitual === "below",
    input.recentPerformance === "declining" && input.decliningSessionCount >= 2,
    input.perceivedExertionTrend === "rising",
  ];
  return signals.filter(Boolean).length >= 3;
}

function nutritionReviewFirst(input: AthleteStateInput): boolean {
  return (
    input.recentPerformance === "declining" &&
    input.decliningSessionCount >= 2 &&
    input.weightTrend === "falling_faster_than_plan" &&
    (input.energyIntakeVsTarget === "below" || input.nutritionAdherence === "below")
  );
}

function possibleStagnation(input: AthleteStateInput): boolean {
  if (input.singleBadSession || input.decliningSessionCount < 3) return false;
  return (
    input.recentPerformance === "declining" &&
    input.recoveryVsHabitual !== "below" &&
    input.nutritionAdherence === "on_plan"
  );
}

function overallState(input: AthleteStateInput): OverallAthleteState {
  const referenceWeeks = clampReferenceWeeks(input.referenceWeeks);
  if (input.sessionsCompleted < 2 && input.weeksOfHistory < 1) return "DADOS_INSUFICIENTES";
  if (input.weeksOfHistory < referenceWeeks) return "CONSTRUINDO_REFERENCIA_INDIVIDUAL";
  if (input.hasLimitation) return "LIMITACAO_PRESENTE";
  if (nutritionReviewFirst(input)) return "REVISAO_NUTRICIONAL_NECESSARIA";
  if (convergentRecovery(input)) return "RECUPERACAO_REDUZIDA";
  if (input.decliningSessionCount >= 2 && input.recentPerformance === "declining") {
    return "DESEMPENHO_EM_QUEDA";
  }
  if (possibleStagnation(input)) return "POSSIVEL_ESTAGNACAO";
  if (input.nutritionAdherence === "below" && input.recentPerformance !== "declining") {
    return "REVISAO_DE_ADERENCIA_NECESSARIA";
  }
  if (input.recentPerformance === "progressing") return "PROGREDINDO";
  return "ESTAVEL";
}

function reasons(input: AthleteStateInput, overall: OverallAthleteState): string[] {
  const items: string[] = [];
  if (overall === "CONSTRUINDO_REFERENCIA_INDIVIDUAL") {
    items.push("Ainda estamos aprendendo o padrão individual deste atleta.");
  }
  if (input.isolatedBadNight) {
    items.push("Uma noite abaixo do habitual, com histórico recente estável.");
  }
  if (convergentRecovery(input)) {
    items.push(
      "A queda de desempenho ocorreu ao mesmo tempo em que sono, energia e recuperação ficaram abaixo do padrão habitual.",
    );
  }
  if (nutritionReviewFirst(input)) {
    items.push(
      "O desempenho caiu enquanto o peso diminuiu mais rápido que o planejado e a ingestão ficou abaixo da meta.",
    );
  }
  if (input.singleBadSession) {
    items.push("Uma sessão isolada não caracteriza estagnação.");
  }
  if (input.heartRateEnabled && input.heartRateVsHabitual === "changed" && input.recentPerformance !== "declining") {
    items.push("A frequência cardíaca isolada não justifica alterar o treino.");
  }
  if (!input.checkinPresent) {
    items.push("Não houve informação aguda antes da sessão.");
  }
  if (
    input.weightTrend === "stable" &&
    input.waistTrend === "decreasing" &&
    input.skinfoldTrend === "decreasing" &&
    input.recentPerformance === "progressing"
  ) {
    items.push("Peso estável com cintura e dobras em queda, enquanto o desempenho melhorou.");
  }
  return items;
}

export function missingDataKeys(input: AthleteStateInput): string[] {
  const missing: string[] = [];
  if (!input.checkinPresent) missing.push("checkin_pre_treino");
  if (!input.checkoutPresent) missing.push("checkout_pos_treino");
  if (input.nutritionAdherence === "unknown") missing.push("nutricao");
  if (input.recoveryVsHabitual === "unknown" && !input.checkinPresent) missing.push("recuperacao_aguda");
  if (!input.heartRateEnabled) {
    /* desligada: ignorar completamente */
  } else if (input.heartRateVsHabitual === "unknown") {
    missing.push("frequencia_cardiaca");
  }
  if (input.weightTrend === "unknown") missing.push("tendencia_de_peso");
  return missing;
}

export function buildAthleteState(input: AthleteStateInput): AthleteStateSnapshot {
  const overall = overallState(input);
  const qualidade = input.dataQuality;
  const confianca = confidenceFromQuality(qualidade, {
    checkinMissing: !input.checkinPresent,
    fewSessions: input.sessionsCompleted < 4,
  }) as ConfidenceLevel;
  const now = input.nowIso ?? new Date().toISOString();
  const dadosAusentes = missingDataKeys(input);

  return {
    estadoGeral: overall,
    treinamento: { estado: trainingDomain(input), confianca },
    recuperacao: { estado: recoveryDomain(input), confianca },
    nutricao: { estado: nutritionDomain(input), confianca },
    composicaoCorporal: { estado: bodyDomain(input), confianca },
    respostaCardiaca: {
      estado: heartRateDomain(input),
      habilitada: input.heartRateEnabled,
      confianca: input.heartRateEnabled ? confianca : "INSUFICIENTE",
    },
    aderencia: {
      estado:
        input.sessionsPlanned <= 0
          ? "INDEFINIDO"
          : input.sessionsCompleted / input.sessionsPlanned >= 0.85
            ? "ALTA"
            : input.sessionsCompleted / input.sessionsPlanned >= 0.6
              ? "MODERADA"
              : "BAIXA",
    },
    limitacoes: input.hasLimitation ? ["limitacao_presente"] : [],
    alertas: nutritionReviewFirst(input)
      ? ["revisar_nutricao_antes_de_reduzir_treino"]
      : convergentRecovery(input)
        ? ["recuperacao_reduzida"]
        : [],
    dadosAusentes,
    motivos: reasons(input, overall),
    geradoEm: now,
    versaoAlgoritmo: ATHLETE_STATE_ALGORITHM_VERSION,
    qualidadeDosDados: qualidade,
    periodoInicio: null,
    periodoFim: null,
  };
}

export function keepWhenTied(buildingReference: boolean, changeJustified: boolean): boolean {
  if (buildingReference && !changeJustified) return true;
  return !changeJustified;
}
