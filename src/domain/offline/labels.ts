import type { ConnectionUiKind } from "./types";

export const SYNC_COPY = {
  synced: "Sincronizado",
  syncing: "Sincronizando...",
  offline: "Offline",
  offlineSaving: "Offline • salvando neste dispositivo",
  offlineSavedDevice: "Offline • salvo neste dispositivo",
  syncError: "Não foi possível sincronizar",
  pendingOne: "1 alteração aguardando sincronização",
  everythingSynced: "Tudo sincronizado",
  nextWorkoutReady: "Próximo treino disponível offline",
  nextWorkoutPartial: "Parte dos dados do próximo treino ainda não está neste dispositivo",
  syncNow: "Sincronizar agora",
  lastSync: "Última sincronização",
  notYetSynced: "Ainda não sincronizado com o servidor",
  stalePrefix: "Dados atualizados até",
  install: "Adicionar Tervelo ao dispositivo",
  updateAvailable: "Uma atualização do Tervelo está disponível.",
  recoveredTitle: "Treino em andamento",
  continueWorkout: "Continuar treino",
  endSession: "Encerrar sessão",
  setRecorded: "Série registrada",
  coachUnavailable: "Coach temporariamente indisponível offline.",
  coachAnalysisWhenOnline: "Análise do Coach disponível quando você estiver online.",
  pendingAnalysis: "Análise será gerada quando você estiver online.",
  savedOnDevice: "Tudo salvo neste dispositivo",
  checkinSavedCoachLater:
    "Seu check-in foi salvo. O Coach poderá analisar quando a conexão voltar.",
  mediaWhenOnline: "Vídeo disponível quando estiver online.",
  photoWaiting: "Foto aguardando envio",
  logoutPendingTitle: "Existem alterações neste dispositivo que ainda não foram sincronizadas.",
  logoutCancel: "Cancelar",
  logoutTrySync: "Tentar sincronizar",
  logoutAnyway: "Sair mesmo assim",
  noConnectionA11y: "Sem conexão. Seus registros estão sendo salvos neste dispositivo.",
  bannerOffline: "Sem conexão • seus registros serão sincronizados depois",
  settingsIntro:
    "O Tervelo mantém os dados necessários para que você possa continuar seus treinos mesmo sem internet.",
  usageOffline: "Uso offline",
  dataAndSync: "Dados e sincronização",
  syncSection: "Sincronização",
} as const;

export function pendingCountCopy(count: number): string {
  if (count <= 0) return SYNC_COPY.everythingSynced;
  if (count === 1) return SYNC_COPY.pendingOne;
  return `${count} alterações aguardando sincronização`;
}

export function connectionUiCopy(kind: ConnectionUiKind, pendingCount = 0): string {
  switch (kind) {
    case "ONLINE_SYNCED":
      return SYNC_COPY.synced;
    case "ONLINE_SYNCING":
      return SYNC_COPY.syncing;
    case "OFFLINE_READY":
      return SYNC_COPY.offline;
    case "OFFLINE_PARTIAL":
      return SYNC_COPY.offline;
    case "SYNC_PENDING":
      return pendingCountCopy(pendingCount);
    case "SYNC_ERROR":
      return SYNC_COPY.syncError;
    default:
      return SYNC_COPY.synced;
  }
}

export function formatLastSyncedAt(iso: string | null, now = new Date()): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Hoje, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return `Ontem, ${time}`;
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${day}, ${time}`;
}

export function recoveredSessionCopy(startedAtIso: string): string {
  const date = new Date(startedAtIso);
  const time = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return time
    ? `Você iniciou esta sessão às ${time}.`
    : "Você iniciou esta sessão neste dispositivo.";
}

export function deriveConnectionUiKind(input: {
  online: boolean;
  syncing: boolean;
  pendingCount: number;
  hasError: boolean;
  offlineReady: boolean;
}): ConnectionUiKind {
  if (!input.online) {
    return input.offlineReady ? "OFFLINE_READY" : "OFFLINE_PARTIAL";
  }
  if (input.syncing) return "ONLINE_SYNCING";
  if (input.hasError) return "SYNC_ERROR";
  if (input.pendingCount > 0) return "SYNC_PENDING";
  return "ONLINE_SYNCED";
}
