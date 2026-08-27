import { IDENTITY_COOKIE, isUserId } from "@/lib/auth/identity";
import { PREVIEW_USER_ID } from "@/lib/auth/local-preview";

/**
 * Chave de isolamento do armazenamento local. Sem ela, duas contas no mesmo
 * navegador compartilhariam treino, medidas e fila de sincronização.
 */
export function currentOfflineUserId(): string {
  if (typeof document === "undefined") return PREVIEW_USER_ID;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${IDENTITY_COOKIE}=`))
    ?.slice(IDENTITY_COOKIE.length + 1);
  if (!raw) return PREVIEW_USER_ID;
  const value = decodeURIComponent(raw);
  return isUserId(value) ? value : PREVIEW_USER_ID;
}
