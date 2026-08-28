import { LIVE_SESSION_KEY, SET_RESULT_QUEUE_KEY } from "@/lib/training/live-session";
import { ATHLETE_STATE_STORE_KEY } from "@/lib/athlete-state/session-store";
import { HEART_RATE_SESSION_KEY } from "@/lib/heart-rate/session-store";
import { LONGITUDINAL_KEY } from "@/lib/longitudinal/preview-store";
import { ONBOARDING_STORAGE_KEY } from "@/lib/auth/onboarding";

const CLEARED_UNSCOPED = "tervelo-cleared-unscoped-v1";
const COACH_PROPOSAL_KEY = "tervelo.preview.coachProposal.v1";

/**
 * Chaves globais misturavam contas no mesmo navegador (nome, medidas, treino).
 * Não herdamos esse conteúdo: cada usuário começa com o próprio IndexedDB.
 */
export async function migrateLegacyLocalStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(CLEARED_UNSCOPED) === "1") {
      window.localStorage.removeItem(LIVE_SESSION_KEY);
      window.localStorage.removeItem(SET_RESULT_QUEUE_KEY);
      window.localStorage.removeItem(ATHLETE_STATE_STORE_KEY);
      window.localStorage.removeItem(HEART_RATE_SESSION_KEY);
      window.localStorage.removeItem(LONGITUDINAL_KEY);
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      window.localStorage.removeItem(COACH_PROPOSAL_KEY);
      return;
    }
    window.localStorage.removeItem(LIVE_SESSION_KEY);
    window.localStorage.removeItem(SET_RESULT_QUEUE_KEY);
    window.localStorage.removeItem(ATHLETE_STATE_STORE_KEY);
    window.localStorage.removeItem(HEART_RATE_SESSION_KEY);
    window.localStorage.removeItem(LONGITUDINAL_KEY);
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    window.localStorage.removeItem(COACH_PROPOSAL_KEY);
    window.localStorage.setItem(CLEARED_UNSCOPED, "1");
  } catch {
    /* private mode */
  }
}
