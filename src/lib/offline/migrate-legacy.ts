import { LIVE_SESSION_KEY, SET_RESULT_QUEUE_KEY } from "@/lib/training/live-session";
import { ATHLETE_STATE_STORE_KEY } from "@/lib/athlete-state/session-store";
import { HEART_RATE_SESSION_KEY } from "@/lib/heart-rate/session-store";
import { LONGITUDINAL_KEY } from "@/lib/longitudinal/preview-store";
import { getKv, KV_KEYS, putKv } from "./idb";
import { currentOfflineUserId } from "./user-scope";

const MIGRATED_META = "legacy-ls-migrated-v1";

function readJson(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function migrateLegacyLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  const userId = currentOfflineUserId();
  const already = await getKv<boolean>(userId, MIGRATED_META);
  const liveExisting = await getKv(userId, KV_KEYS.liveSession);
  if (already && liveExisting) {
    window.localStorage.removeItem(LIVE_SESSION_KEY);
    window.localStorage.removeItem(SET_RESULT_QUEUE_KEY);
    return;
  }

  const live = readJson(LIVE_SESSION_KEY);
  if (live && !liveExisting) {
    await putKv(userId, KV_KEYS.liveSession, live);
  }
  const athlete = readJson(ATHLETE_STATE_STORE_KEY);
  if (athlete && !(await getKv(userId, KV_KEYS.athleteState))) {
    await putKv(userId, KV_KEYS.athleteState, athlete);
  }
  const heart = readJson(HEART_RATE_SESSION_KEY);
  if (heart && !(await getKv(userId, KV_KEYS.heartRateSession))) {
    await putKv(userId, KV_KEYS.heartRateSession, heart);
  }
  const longitudinal = readJson(LONGITUDINAL_KEY);
  if (longitudinal && !(await getKv(userId, KV_KEYS.longitudinal))) {
    await putKv(userId, KV_KEYS.longitudinal, longitudinal);
  }

  window.localStorage.removeItem(LIVE_SESSION_KEY);
  window.localStorage.removeItem(SET_RESULT_QUEUE_KEY);
  window.localStorage.removeItem(ATHLETE_STATE_STORE_KEY);
  window.localStorage.removeItem(HEART_RATE_SESSION_KEY);
  window.localStorage.removeItem(LONGITUDINAL_KEY);
  await putKv(userId, MIGRATED_META, true);
}
