import { overallStateCopy } from "./labels";
import type { AthleteStateSnapshot, ChangeScope } from "./types";

export type WeeklyReviewInput = {
  athleteState: AthleteStateSnapshot;
  previousWeekState: Pick<AthleteStateSnapshot, "estadoGeral"> | null;
  blockTrend: "unknown" | "progressing" | "stable" | "declining";
  sessionsPlanned: number;
  sessionsCompleted: number;
  progressedExerciseCount: number;
  nutritionOnPlan: boolean | null;
  bodyRecompositionFavorable: boolean;
  heartRateEnabled: boolean;
  heartRateRelevantCopy: string | null;
  trainingArchitectAllowsDeload: boolean;
  newBodyMeasurementThisWeek: boolean;
  nutritionStable: boolean;
};

export type WeeklyReview = {
  titulo: string;
  visaoGeral: string;
  oQueEvoluiu: string;
  oQueMereceAtencao: string;
  treinamento: string;
  nutricao: string;
  corpoEMedidas: string | null;
  recuperacao: string;
  frequenciaCardiaca: string | null;
  proximaSemana: string;
  decisao: ChangeScope;
  decisaoCopy: string;
  manterTreino: boolean;
  revisarNutricao: boolean;
  considerarSemanaRecuperacao: boolean;
  agentesInvocados: string[];
};

function keepPlanCopy(input: WeeklyReviewInput): string {
  const sessions = `${input.sessionsCompleted} ${input.sessionsCompleted === 1 ? "sessão" : "sessões"}`;
  return `Você completou ${sessions} planejadas e apresentou progressão em ${input.progressedExerciseCount} exercícios. Sua recuperação permaneceu próxima ao seu padrão habitual e a estratégia nutricional apresentou boa aderência. Não há justificativa pelos dados atuais para modificar o bloco.`;
}

export function selectAgentsForWeeklyReview(input: WeeklyReviewInput): string[] {
  const agents = ["orchestrator", "profiler", "progress", "periodization", "recovery", "qa"];
  if (!input.nutritionStable) agents.splice(agents.indexOf("qa"), 0, "nutrition");
  if (input.newBodyMeasurementThisWeek) agents.splice(agents.indexOf("qa"), 0, "body_composition");
  return agents;
}

export function buildWeeklyReview(input: WeeklyReviewInput): WeeklyReview {
  const state = input.athleteState.estadoGeral;
  const agentesInvocados = selectAgentsForWeeklyReview(input);

  if (state === "CONSTRUINDO_REFERENCIA_INDIVIDUAL" || state === "DADOS_INSUFICIENTES") {
    return {
      titulo: "Aprendendo seu padrão",
      visaoGeral:
        "Ainda estamos conhecendo como você responde ao treino, à recuperação e à rotina. Neste momento o mais útil é coletar com consistência e alterar pouco.",
      oQueEvoluiu: "Os primeiros registros já ajudam a formar a referência individual.",
      oQueMereceAtencao: "Evitar mudanças estruturais enquanto o padrão ainda está em construção.",
      treinamento: "O plano da semana permanece. Coletar mais, alterar menos.",
      nutricao:
        input.nutritionOnPlan == null
          ? "Ainda não há contexto nutricional suficiente para revisar metas."
          : "A ingestão registrada entra no aprendizado do padrão, sem recalcular metas agora.",
      corpoEMedidas: input.newBodyMeasurementThisWeek
        ? "Há medidas novas; elas entram na referência, sem exigir avaliação semanal."
        : null,
      recuperacao:
        "Check-ins, quando houver, servem para aprender o habitual — não para mudar o bloco.",
      frequenciaCardiaca: input.heartRateEnabled ? input.heartRateRelevantCopy : null,
      proximaSemana: "Manter o plano e observar a resposta.",
      decisao: "SEM_MUDANCA",
      decisaoCopy: "Plano mantido",
      manterTreino: true,
      revisarNutricao: false,
      considerarSemanaRecuperacao: false,
      agentesInvocados,
    };
  }

  if (state === "REVISAO_NUTRICIONAL_NECESSARIA") {
    return {
      titulo: "Revisão nutricional",
      visaoGeral:
        "Seu desempenho caiu nas últimas sessões enquanto sua média de peso vem diminuindo mais rapidamente que o planejado. Sua ingestão registrada também ficou abaixo da meta durante boa parte da semana. Antes de reduzir o treinamento, vale corrigir a aderência nutricional e observar a resposta.",
      oQueEvoluiu:
        "O treino segue sendo executado; o sinal mais claro não está no volume estrutural.",
      oQueMereceAtencao:
        "A principal limitação nutricional foi a aderência energética, e não a necessidade de recalcular suas metas.",
      treinamento:
        "Manter o treino neste momento. Uma queda de desempenho não vira corte de volume automático.",
      nutricao:
        "Sua ingestão de proteína e energia precisa voltar para perto do planejamento antes de mexer no bloco.",
      corpoEMedidas:
        "A tendência de peso — não um registro isolado — ficou mais rápida que o combinado.",
      recuperacao:
        input.athleteState.recuperacao.estado === "ABAIXO_DO_HABITUAL"
          ? "A recuperação também ficou abaixo do habitual, mas o conjunto aponta primeiro para a nutrição."
          : "A recuperação não é o principal sinal desta semana.",
      frequenciaCardiaca: input.heartRateEnabled ? input.heartRateRelevantCopy : null,
      proximaSemana: "Revisar aderência nutricional e reavaliar o desempenho na próxima semana.",
      decisao: "SEM_MUDANCA",
      decisaoCopy: "Plano mantido · revisar nutrição",
      manterTreino: true,
      revisarNutricao: true,
      considerarSemanaRecuperacao: false,
      agentesInvocados,
    };
  }

  if (state === "RECUPERACAO_REDUZIDA") {
    const considerar = input.trainingArchitectAllowsDeload && input.blockTrend === "declining";
    return {
      titulo: "Recuperação reduzida",
      visaoGeral:
        "Nas últimas duas semanas houve queda de desempenho acompanhada por maior percepção de esforço e recuperação abaixo do seu padrão habitual. A aderência nutricional permaneceu adequada.",
      oQueEvoluiu: "A aderência às sessões permanece utilizável para decidir com segurança.",
      oQueMereceAtencao:
        "Sono, energia e recuperação muscular ficaram abaixo do habitual em várias sessões.",
      treinamento: considerar
        ? "Se as regras do Arquiteto de Treinamento permitirem, uma semana de recuperação pode ser considerada."
        : "Ainda não há evidência suficiente para alterar o bloco inteiro. Observar mais uma semana.",
      nutricao: "A estratégia nutricional não aparece como o limitante principal.",
      corpoEMedidas: input.newBodyMeasurementThisWeek
        ? "Medidas novas entram como contexto, sem forçar reavaliação."
        : null,
      recuperacao:
        "A recuperação ficou abaixo do seu padrão — comparação individual, não populacional.",
      frequenciaCardiaca: input.heartRateEnabled ? input.heartRateRelevantCopy : null,
      proximaSemana: considerar
        ? "Se a semana de recuperação for aceita, reavaliar volume no fechamento seguinte."
        : "Manter o plano e reavaliar recuperação no fechamento da próxima semana.",
      decisao: considerar ? "AJUSTE_DA_SEMANA" : "SEM_MUDANCA",
      decisaoCopy: considerar ? "Volume ajustado" : "Plano mantido",
      manterTreino: !considerar,
      revisarNutricao: false,
      considerarSemanaRecuperacao: considerar,
      agentesInvocados,
    };
  }

  if (input.bodyRecompositionFavorable) {
    return {
      titulo: "Progressão adequada",
      visaoGeral:
        "Embora seu peso esteja praticamente estável, cintura e dobras diminuíram enquanto seu desempenho melhorou. O conjunto dos dados favorece manter a estratégia atual.",
      oQueEvoluiu: "Desempenho em alta, com medidas corporais no sentido do objetivo.",
      oQueMereceAtencao: "Nada neste recorte pede troca de bloco.",
      treinamento: "Manter treino.",
      nutricao: "Manter estratégia nutricional.",
      corpoEMedidas:
        "Peso estável não contradiz a recomposição quando cintura e dobras caem juntos.",
      recuperacao: "Recuperação compatível com o padrão habitual.",
      frequenciaCardiaca: input.heartRateEnabled ? input.heartRateRelevantCopy : null,
      proximaSemana: "Seguir o plano e observar a mesma tendência.",
      decisao: "SEM_MUDANCA",
      decisaoCopy: "Plano mantido",
      manterTreino: true,
      revisarNutricao: false,
      considerarSemanaRecuperacao: false,
      agentesInvocados,
    };
  }

  if (state === "POSSIVEL_ESTAGNACAO") {
    return {
      titulo: "Possível estagnação",
      visaoGeral:
        "Há pouca progressão em exercícios comparáveis ao longo do bloco. Uma sessão isolada não basta; o sinal aparece só com persistência.",
      oQueEvoluiu: "A aderência permite comparar semanas.",
      oQueMereceAtencao: "Cargas e repetições avançam pouco nas sessões comparáveis.",
      treinamento:
        "Ainda preferimos a menor alteração. Reavaliar no fechamento da próxima semana antes de mexer no programa.",
      nutricao: input.nutritionOnPlan
        ? "A ingestão registrada permaneceu próxima ao planejamento na maior parte da semana."
        : "A nutrição entra como contexto, sem número isolado.",
      corpoEMedidas: input.newBodyMeasurementThisWeek ? "Há medidas novas nesta semana." : null,
      recuperacao: "A recuperação não explica sozinha a falta de progressão.",
      frequenciaCardiaca: input.heartRateEnabled ? input.heartRateRelevantCopy : null,
      proximaSemana: "Observar se a tendência se confirma antes de alterar o programa.",
      decisao: "SEM_MUDANCA",
      decisaoCopy: "Plano mantido",
      manterTreino: true,
      revisarNutricao: false,
      considerarSemanaRecuperacao: false,
      agentesInvocados,
    };
  }

  const progressing = state === "PROGREDINDO" || state === "ESTAVEL";
  return {
    titulo: progressing ? "Semana consistente" : overallStateCopy(state),
    visaoGeral: keepPlanCopy(input),
    oQueEvoluiu:
      input.progressedExerciseCount > 0
        ? `Progressão em ${input.progressedExerciseCount} exercícios comparáveis.`
        : "A semana foi executada conforme o plano.",
    oQueMereceAtencao: "Nada neste recorte pede mudança estrutural.",
    treinamento: "O planejamento atual continua funcionando para este atleta.",
    nutricao: input.nutritionOnPlan
      ? "Sua ingestão de proteína permaneceu próxima ao planejamento na maior parte da semana."
      : "Não há contexto nutricional suficiente para revisar metas.",
    corpoEMedidas: input.newBodyMeasurementThisWeek
      ? "Medidas novas entram na tendência, sem exigir avaliação semanal."
      : null,
    recuperacao: "A recuperação permaneceu próxima ao seu padrão habitual.",
    frequenciaCardiaca: input.heartRateEnabled ? input.heartRateRelevantCopy : null,
    proximaSemana: "Manter o plano e observar a resposta.",
    decisao: "SEM_MUDANCA",
    decisaoCopy: "Plano mantido",
    manterTreino: true,
    revisarNutricao: false,
    considerarSemanaRecuperacao: false,
    agentesInvocados,
  };
}

export type DecisionFollowUp = {
  originalDecision: ChangeScope;
  followUpPeriodStart: string;
  followUpPeriodEnd: string;
  subsequentPerformance: "unknown" | "improved" | "stable" | "declined";
  subsequentRecovery: "unknown" | "improved" | "stable" | "declined";
  subsequentAdherence: "unknown" | "high" | "moderate" | "low";
  assertCausality: false;
};

export function recordDecisionOutcome(
  input: Omit<DecisionFollowUp, "assertCausality">,
): DecisionFollowUp {
  return { ...input, assertCausality: false };
}
