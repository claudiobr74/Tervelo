import type { ConflictDomain, ConflictResolution } from "./types";

export function resolveConflict(input: {
  domain: ConflictDomain;
  sessionActive: boolean;
  localExists: boolean;
  remoteExists: boolean;
  independentOperations?: boolean;
}): ConflictResolution {
  if (input.domain === "active_session" && input.sessionActive && input.localExists) {
    return {
      decision: "keep_local",
      reason: "Sessão ativa local tem prioridade operacional até a reconciliação.",
      discardSilent: false,
    };
  }

  if (
    input.domain === "set_result" ||
    input.domain === "heart_rate" ||
    input.domain === "checkin"
  ) {
    if (input.localExists && input.remoteExists && input.independentOperations) {
      return {
        decision: "keep_both",
        reason: "Eventos append-only independentes são preservados.",
        discardSilent: false,
      };
    }
    return {
      decision: "keep_both",
      reason: "Registros de execução nunca são descartados silenciosamente.",
      discardSilent: false,
    };
  }

  if (input.domain === "prescription" || input.domain === "program") {
    if (input.sessionActive) {
      return {
        decision: "keep_local",
        reason: "A prescrição da sessão em andamento permanece congelada.",
        discardSilent: false,
      };
    }
    return {
      decision: "apply_domain_rule",
      reason: "Prescrição remota vale para sessões futuras; execução local é preservada.",
      discardSilent: false,
    };
  }

  if (input.domain === "execution") {
    return {
      decision: "keep_local",
      reason: "Execução registrada pelo atleta não cede a uma prescrição remota posterior.",
      discardSilent: false,
    };
  }

  if (input.independentOperations) {
    return {
      decision: "keep_both",
      reason: "Operações independentes podem ser mescladas.",
      discardSilent: false,
    };
  }

  return {
    decision: "preserve_for_reconciliation",
    reason: "Na dúvida, preservar para reconciliação em vez de perder o registro.",
    discardSilent: false,
  };
}

export function neverLastWriteWinsGlobally(): true {
  return true;
}
