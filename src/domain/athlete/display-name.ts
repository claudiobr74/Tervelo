/**
 * Primeiro nome para saudação. Aceita nome completo ("Lucas Mendes") e também
 * identificadores vindos do e-mail ("lucas.atleta"), sem inventar nome quando
 * não há informação.
 */
export function firstName(displayName: string | null | undefined): string {
  const raw = (displayName ?? "").trim();
  if (!raw) return "";
  const token = raw.split(/[\s._-]+/).find((part) => part.length > 0);
  if (!token) return "";
  return token.charAt(0).toLocaleUpperCase("pt-BR") + token.slice(1);
}

export function greeting(displayName: string | null | undefined): string {
  const name = firstName(displayName);
  return name ? `Olá, ${name}.` : "Olá.";
}

/** Nome visível: rascunho do onboarding, senão o da sessão. Nunca um nome de outra pessoa. */
export function athleteDisplayName(
  draftName: string | null | undefined,
  sessionName: string | null | undefined,
): string {
  const draft = (draftName ?? "").trim();
  if (draft) return draft;
  return (sessionName ?? "").trim();
}

export function initialsFromName(displayName: string | null | undefined): string {
  const raw = (displayName ?? "").trim();
  if (!raw) return "A";
  const parts = raw.split(/[\s._-]+/).filter((part) => part.length > 0);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0).toLocaleUpperCase("pt-BR"));
  return letters.join("") || "A";
}
