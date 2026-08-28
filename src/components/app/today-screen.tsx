"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import { greeting, initialsFromName } from "@/domain/athlete/display-name";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { deltaInWindow, round1 } from "@/domain/measurement/composition";
import { latestByTime } from "@/domain/measurement/append-only";
import { recoveryPercent, recoveryReadinessCopy } from "@/domain/recovery/score";
import { formatMeasure, formatPercent, formatSignedDelta } from "@/lib/longitudinal/format";
import { useAthleteStateStore } from "@/lib/athlete-state/session-store";
import { useLongitudinal } from "@/lib/longitudinal/preview-store";
import { useOnboardingDraft } from "@/components/onboarding/onboarding-provider";
import { useLiveSession } from "@/lib/training/live-session";
import { useAthleteTraining } from "@/lib/training/use-athlete-training";
import { useNutritionOffline } from "@/lib/nutrition/offline-store";
import { RecoveredSessionCard } from "@/components/app/recovered-session-card";
import { SyncStatusIndicator } from "@/components/app/sync-status-indicator";

const WEIGHT_WINDOW_DAYS = 30;

export function TodayScreen({ sessionName = null }: { sessionName?: string | null }) {
  const live = useLiveSession();
  const athlete = useAthleteStateStore();
  const nutrition = useNutritionOffline();
  const { draft } = useOnboardingDraft();
  const longitudinal = useLongitudinal();
  const training = useAthleteTraining();
  const checkinDone = athlete.preWorkout?.status === "completed";
  const checkinSkipped = athlete.preWorkout?.status === "skipped";

  const hello = greeting(draft.displayName || sessionName);

  // Mesmas fontes de /app/body, /app/recovery, /app/nutrition e /app/progress:
  // um número diferente aqui seria o app se contradizendo.
  const points = longitudinal.measurements.map((row) => ({
    id: row.id,
    recordedAt: new Date(row.measuredAt),
    supersedesId: row.supersedesId,
    weightKg: row.weightKg,
    bodyFatPercent: row.bodyFatPercent,
  }));
  const latestBody = latestByTime(points);
  const weightDelta = deltaInWindow(points, "weightKg", new Date(), WEIGHT_WINDOW_DAYS);
  const latestCheckin = longitudinal.checkins
    .slice()
    .sort((a, b) => Date.parse(a.checkedInAt) - Date.parse(b.checkedInAt))
    .at(-1);
  const recoveryScore = latestCheckin?.perceivedRecovery ?? null;
  const coachCopy = athlete.todayAdjustment
    ? athlete.todayAdjustment.whatChanged
    : athlete.sessionKeptCopy;

  return (
    <AthleteAppShell active="Hoje">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">{hello}</h1>
            <p className="text-sm text-muted">Veja seu dia.</p>
            <SyncStatusIndicator />
          </div>
          <Link href="/app/profile" className="size-10 shrink-0" aria-label="Perfil">
            <InitialsAvatar
              name={initialsFromName(draft.displayName || sessionName)}
              size={40}
              className="border border-border"
            />
          </Link>
        </header>

        <RecoveredSessionCard live={live} />

        <section className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-brand">Treino de hoje</p>
            {recoveryScore !== null ? (
              <span className="rounded-full bg-success/20 px-2.5 py-1 text-[11px] font-semibold text-success">
                Recuperação: {recoveryReadinessCopy(recoveryScore)}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            {training.workout ? (
              <>
                <h2 className="text-xl font-bold text-foreground">{training.workout.title}</h2>
                <p className="text-[13px] text-muted">
                  {training.workout.exercises.length} exercícios
                  {training.workout.focus ? ` · ${training.workout.focus}` : ""}
                </p>
                <Link
                  href={`/app/workout?session=${training.workout.id}`}
                  className="mt-2 flex h-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand text-sm font-bold text-on-brand"
                >
                  Abrir treino de hoje
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground">Nenhum treino prescrito</h2>
                <p className="text-[13px] text-muted">
                  Quando houver um plano para hoje, ele aparece aqui.
                </p>
                <div className="mt-2 flex gap-3">
                  <Link href="/app/plan" className="text-sm font-semibold text-brand">
                    Montar plano
                  </Link>
                  <Link href="/app/calendar" className="text-sm font-semibold text-brand">
                    Calendário
                  </Link>
                </div>
              </>
            )}
          </div>
          {athlete.todayAdjustment ? (
            <Link href="/app/coach/ajuste" className="text-center text-sm font-semibold text-brand">
              Ver ajuste de hoje
            </Link>
          ) : athlete.sessionKeptCopy ? (
            <p className="text-center text-sm text-foreground">{athlete.sessionKeptCopy}</p>
          ) : null}
        </section>

        {live.status === "idle" ? (
          <section className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <p className="text-xs font-bold uppercase text-brand">Check-in rápido</p>
            <h2 className="text-base font-bold text-foreground">
              Como você está para treinar hoje?
            </h2>
            {checkinDone ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <FigmaIcon
                  src="/icons/check-circle.svg"
                  alt=""
                  size={16}
                  className="text-success"
                />
                Check-in concluído
              </p>
            ) : checkinSkipped ? (
              <p className="text-sm text-muted">Sem informação aguda hoje.</p>
            ) : (
              <Link
                href="/app/workout/checkin"
                className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] border border-border text-sm font-bold text-foreground"
              >
                Fazer check-in
              </Link>
            )}
            <p className="text-[11px] text-muted">{PRODUCT_NAMES.preWorkoutCheckin}</p>
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/app/recovery"
            className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">Recuperação</p>
              <FigmaIcon src="/icons/shield.svg" alt="" size={14} className="text-success" />
            </div>
            <div className="flex flex-col gap-1">
              {recoveryScore !== null ? (
                <>
                  <p className="text-2xl font-bold text-success">
                    {formatPercent(recoveryPercent(recoveryScore), 0)}
                  </p>
                  <p className="text-xs text-muted">{recoveryReadinessCopy(recoveryScore)}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">—</p>
                  <p className="text-xs text-muted">Faça seu check-in de recuperação</p>
                </>
              )}
            </div>
          </Link>
          <Link
            href="/app/nutrition"
            className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">Nutrição</p>
              <FigmaIcon src="/icons/flame.svg" alt="" size={14} className="text-brand" />
            </div>
            <div className="flex flex-col gap-1">
              {nutrition.extraFluidMl > 0 ? (
                <>
                  <p className="text-base font-bold text-foreground">
                    {(nutrition.extraFluidMl / 1000).toLocaleString("pt-BR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    L
                  </p>
                  <p className="text-xs text-muted">Água registrada hoje</p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-foreground">—</p>
                  <p className="text-xs text-muted">Sem refeições registradas</p>
                </>
              )}
            </div>
          </Link>
          <Link
            href="/app/body"
            className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold text-muted">Peso e Composição</p>
            <div className="flex items-baseline gap-2">
              <p className="text-[22px] font-bold text-foreground">
                {latestBody?.weightKg !== undefined
                  ? formatMeasure(latestBody.weightKg, "kg")
                  : "—"}
              </p>
              {weightDelta !== null && weightDelta !== 0 ? (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-success">
                  <FigmaIcon
                    src={weightDelta < 0 ? "/icons/trending-down.svg" : "/icons/trending-up.svg"}
                    alt=""
                    size={12}
                    className="text-success"
                  />
                  {formatSignedDelta(round1(weightDelta), "kg")}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-tertiary">
              {latestBody?.bodyFatPercent !== undefined
                ? `Massa gorda está em ${formatPercent(latestBody.bodyFatPercent)}`
                : "Registre sua primeira medida"}
            </p>
          </Link>
          <Link
            href="/app/progress"
            className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold text-muted">Volume Total de Carga</p>
            <p className="text-[22px] font-bold text-foreground">—</p>
            <p className="text-[11px] text-tertiary">Sem histórico de carga</p>
          </Link>
        </div>

        {coachCopy ? (
          <Link
            href="/app/coach"
            className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
              <FigmaIcon src="/icons/brain.svg" alt="" size={20} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-[13px] font-bold uppercase text-brand">Mensagem do treinador</p>
              <p className="text-[13px] text-foreground">“{coachCopy}”</p>
            </div>
          </Link>
        ) : null}
      </div>
    </AthleteAppShell>
  );
}
