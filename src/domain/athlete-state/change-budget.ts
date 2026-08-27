import type { ChangeScope } from "./types";

export type ProposedChange = {
  id: string;
  scope: ChangeScope;
  axis: "volume" | "exercise" | "frequency" | "nutrition" | "block" | "session";
  justification: "weak" | "moderate" | "strong";
};

export type ChangeBudgetResult = {
  ok: boolean;
  allowed: ProposedChange[];
  blocked: ProposedChange[];
  reason: string | null;
};

const STRUCTURAL_AXES = new Set(["frequency", "block", "nutrition"]);

export function evaluateChangeBudget(changes: ProposedChange[]): ChangeBudgetResult {
  const meaningful = changes.filter((change) => change.scope !== "SEM_MUDANCA");
  if (meaningful.length === 0) {
    return { ok: true, allowed: changes, blocked: [], reason: null };
  }

  const structural = meaningful.filter((change) => change.scope === "ALTERACAO_DO_PROGRAMA");
  const axes = new Set(meaningful.map((change) => change.axis));
  const exerciseChanges = meaningful.filter((change) => change.axis === "exercise").length;
  const strong = meaningful.some((change) => change.justification === "strong");

  if (axes.size >= 3 && !strong) {
    const allowed = [meaningful[0]];
    return {
      ok: false,
      allowed,
      blocked: meaningful.slice(1),
      reason: "Orçamento de Mudanças: preferir a menor alteração necessária.",
    };
  }

  if (exerciseChanges >= 5 && !strong) {
    return {
      ok: false,
      allowed: meaningful.filter((change) => change.axis !== "exercise").slice(0, 1),
      blocked: meaningful.filter((change) => change.axis === "exercise"),
      reason: "Não substituir vários exercícios ao mesmo tempo sem justificativa forte.",
    };
  }

  if (structural.length > 0 && meaningful.some((change) => change.scope === "AJUSTE_DA_SESSAO") && !strong) {
    return {
      ok: false,
      allowed: meaningful.filter((change) => change.scope === "AJUSTE_DA_SESSAO"),
      blocked: structural,
      reason: "Ajuste de sessão não deve virar alteração de programa no mesmo passo.",
    };
  }

  if (axes.has("volume") && STRUCTURAL_AXES.has("frequency") && axes.has("frequency") && !strong) {
    return {
      ok: false,
      allowed: meaningful.filter((change) => change.axis === "volume").slice(0, 1),
      blocked: meaningful.filter((change) => change.axis !== "volume"),
      reason: "Se ajustar volume, não modificar frequência ao mesmo tempo sem justificativa forte.",
    };
  }

  return { ok: true, allowed: meaningful, blocked: [], reason: null };
}

export function classifyChange(input: {
  timeShortage: boolean;
  equipmentUnavailable: boolean;
  acuteRecoveryReduced: boolean;
  discomfort: boolean;
  redistributeWeekVolume: boolean;
  changeSplitOrBlock: boolean;
  deload: boolean;
  nutritionStrategyChange: boolean;
}): ChangeScope {
  if (input.changeSplitOrBlock || input.deload || input.nutritionStrategyChange) {
    return "ALTERACAO_DO_PROGRAMA";
  }
  if (input.redistributeWeekVolume) return "AJUSTE_DA_SEMANA";
  if (input.timeShortage || input.equipmentUnavailable || input.acuteRecoveryReduced || input.discomfort) {
    return "AJUSTE_DA_SESSAO";
  }
  return "SEM_MUDANCA";
}

export function dailyCheckinMayChange(scope: ChangeScope): boolean {
  return scope === "SEM_MUDANCA" || scope === "AJUSTE_DA_SESSAO";
}
