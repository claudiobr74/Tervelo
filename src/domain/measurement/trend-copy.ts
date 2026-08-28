export type BodyTrendInput = {
  weightDelta: number | null;
  waistDelta: number | null;
  fatDelta: number | null;
};

const STABLE_WEIGHT_KG = 0.3;
const STABLE_WAIST_CM = 0.5;
const STABLE_FAT_PERCENT = 0.3;

function direction(value: number | null, tolerance: number): "sobe" | "desce" | "estável" | null {
  if (value === null || !Number.isFinite(value)) return null;
  if (Math.abs(value) <= tolerance) return "estável";
  return value > 0 ? "sobe" : "desce";
}

/**
 * Leitura da evolução a partir das medidas do próprio atleta.
 * Sem medida suficiente devolve `null`: melhor não dizer nada do que afirmar
 * um progresso que os dados não mostram.
 */
export function bodyTrendCopy(input: BodyTrendInput): string | null {
  const weight = direction(input.weightDelta, STABLE_WEIGHT_KG);
  const waist = direction(input.waistDelta, STABLE_WAIST_CM);
  const fat = direction(input.fatDelta, STABLE_FAT_PERCENT);

  if (weight === null && waist === null && fat === null) return null;

  if (weight === "sobe" && (waist === "estável" || waist === "desce")) {
    return "Seu peso está subindo com a cintura estável: o ganho está compatível com massa magra.";
  }
  if (weight === "desce" && (fat === "desce" || waist === "desce")) {
    return "Peso e medidas caindo juntos: a perda de gordura está no caminho esperado.";
  }
  if (weight === "sobe" && waist === "sobe") {
    return "Peso e cintura estão subindo juntos. Vale revisar o superávit calórico com o Coach.";
  }
  if (weight === "estável" && fat === "desce") {
    return "Peso estável com queda de gordura: recomposição corporal em andamento.";
  }
  return "Suas medidas estão estáveis no período. Mantenha a constância para gerar tendência.";
}
