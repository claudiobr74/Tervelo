import { PREVIEW_ADMIN_ID, PREVIEW_USER_ID } from "@/lib/auth/local-preview";
import { deleteKv, getMeta, KV_KEYS, putMeta } from "@/lib/offline/idb";

const PURGE_META = "purged-invented-user-data-v1";

const INVENTED_KEYS = [
  KV_KEYS.liveSession,
  KV_KEYS.prescriptionSnapshot,
  KV_KEYS.catalogToday,
  KV_KEYS.nutrition,
  KV_KEYS.longitudinal,
  KV_KEYS.athleteState,
  KV_KEYS.heartRateSession,
] as const;

/**
 * Apaga snapshot de treino, nutrição, evolução e estado do atleta inventados
 * em visitas anteriores (incluindo o UUID fixo do antigo Lucas compartilhado).
 */
export async function purgeInventedUserData(currentUserId: string): Promise<void> {
  if ((await getMeta<string>(PURGE_META)) === "1") return;

  const userIds = new Set([currentUserId, PREVIEW_USER_ID, PREVIEW_ADMIN_ID]);
  for (const userId of userIds) {
    for (const key of INVENTED_KEYS) {
      await deleteKv(userId, key);
    }
  }

  await putMeta(PURGE_META, "1");
}
