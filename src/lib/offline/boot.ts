import { hydrateAthleteStateFromDurable } from "@/lib/athlete-state/session-store";
import { hydrateHeartRateFromDurable } from "@/lib/heart-rate/session-store";
import { hydrateLongitudinalFromDurable } from "@/lib/longitudinal/preview-store";
import { hydrateLiveSessionFromDurable } from "@/lib/training/live-session";
import { hydrateNutritionFromDurable } from "@/lib/nutrition/offline-store";
import { getKv, KV_KEYS, openOfflineDb } from "./idb";
import { migrateLegacyLocalStorage } from "./migrate-legacy";
import { purgeInventedUserData } from "./purge-preview";
import { loadSyncQueueFromIdb, pendingSyncCount } from "./queue-store";
import { hydrateLastSyncedAt, startSyncEngine } from "./engine-runner";
import { markOfflineBooted, patchSyncStatus } from "./status-store";
import { currentOfflineUserId } from "./user-scope";
import { registerTerveloServiceWorker } from "./register-sw";

let bootPromise: Promise<void> | null = null;

async function bootOnce() {
  await openOfflineDb();
  await migrateLegacyLocalStorage();
  const userId = currentOfflineUserId();
  await purgeInventedUserData(userId);
  await loadSyncQueueFromIdb(userId);
  await hydrateLastSyncedAt();

  const live = await getKv<Parameters<typeof hydrateLiveSessionFromDurable>[0]>(
    userId,
    KV_KEYS.liveSession,
  );
  if (live) hydrateLiveSessionFromDurable(live);

  const athlete = await getKv<Parameters<typeof hydrateAthleteStateFromDurable>[0]>(
    userId,
    KV_KEYS.athleteState,
  );
  if (athlete) hydrateAthleteStateFromDurable(athlete);

  const heart = await getKv<Parameters<typeof hydrateHeartRateFromDurable>[0]>(
    userId,
    KV_KEYS.heartRateSession,
  );
  if (heart) hydrateHeartRateFromDurable(heart);

  const longitudinal = await getKv<Parameters<typeof hydrateLongitudinalFromDurable>[0]>(
    userId,
    KV_KEYS.longitudinal,
  );
  if (longitudinal) hydrateLongitudinalFromDurable(longitudinal);

  const nutrition = await getKv<Parameters<typeof hydrateNutritionFromDurable>[0]>(
    userId,
    KV_KEYS.nutrition,
  );
  if (nutrition) hydrateNutritionFromDurable(nutrition);

  patchSyncStatus({
    offlineReady: true,
    pendingCount: pendingSyncCount(),
  });
  markOfflineBooted();
  if (typeof document !== "undefined") {
    document.body.dataset.offlineBoot = "ready";
  }
  startSyncEngine();
  registerTerveloServiceWorker();
}

export function bootOffline(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!bootPromise) bootPromise = bootOnce();
  return bootPromise;
}
