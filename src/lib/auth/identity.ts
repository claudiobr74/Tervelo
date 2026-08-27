/**
 * Identidade legível pelo cliente. O cookie de sessão é `httpOnly` e guarda o token;
 * este guarda apenas o id do usuário, que o armazenamento offline usa para separar dados.
 */
export const IDENTITY_COOKIE = "terveloUser";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUserId(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function readIdentityCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const raw = cookieHeader
    .split("; ")
    .find((row) => row.startsWith(`${IDENTITY_COOKIE}=`))
    ?.slice(IDENTITY_COOKIE.length + 1);
  if (!raw) return null;
  const value = decodeURIComponent(raw);
  return isUserId(value) ? value : null;
}
