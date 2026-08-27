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
