/** Traduz o corpo de erro do Auth Nhost sem vazar se o e-mail existe. */

export function messageFromAuthBody(body: unknown): string {
  if (!body || typeof body !== "object") return "Não foi possível concluir agora.";
  const record = body as Record<string, unknown>;
  const raw =
    (typeof record.message === "string" && record.message) ||
    (typeof record.error === "string" && record.error) ||
    "";
  const lower = raw.toLowerCase();
  if (
    lower.includes("already exists") ||
    lower.includes("already-exists") ||
    lower.includes("email already")
  ) {
    return "Não foi possível criar a conta com estes dados. Tente entrar ou use outro e-mail.";
  }
  if (
    lower.includes("password") &&
    (lower.includes("short") || lower.includes("least") || lower.includes("min"))
  ) {
    return "A senha não atende ao mínimo do servidor.";
  }
  if (lower.includes("disabled") || lower.includes("sign up")) {
    return "O cadastro está desligado neste ambiente.";
  }
  if (lower.includes("rate") || lower.includes("too many")) {
    return "Muitas tentativas. Aguarde um instante e tente de novo.";
  }
  if (
    lower.includes("incorrect") ||
    lower.includes("invalid-email-password") ||
    lower.includes("invalid email or password")
  ) {
    return "E-mail ou senha não conferem.";
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return "Informe um e-mail válido.";
  }
  if (lower.includes("unverified") || lower.includes("verify")) {
    return "Confirme o e-mail desta conta para entrar.";
  }
  return "Não foi possível concluir agora. Tente de novo.";
}
