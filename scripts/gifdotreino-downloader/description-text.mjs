/** Converte o HTML das fichas Gif do Treino em texto para o banco (sem markup). */

export function stripLeadStrong(html) {
  return String(html || "").replace(/<p><strong>[\s\S]*?<\/strong><\/p>\s*/gi, "");
}

export function htmlToPlainText(html) {
  const withoutLead = stripLeadStrong(html);
  return withoutLead
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export const PATTERN_BY_FOLDER = {
  Peitoral: "horizontal_push",
  Costas: "horizontal_pull",
  Ombros: "vertical_push",
  Pernas: "squat",
  Glúteos: "hinge",
  "Eretor Lombar": "hinge",
  Bíceps: "isolation",
  Tríceps: "isolation",
  Antebraços: "isolation",
  Panturrilhas: "isolation",
  Trapézio: "vertical_pull",
};
