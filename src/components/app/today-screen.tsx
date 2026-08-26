"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { startWorkout, useLiveSession } from "@/lib/training/live-session";
import { PREVIEW_WORKOUT } from "@/lib/training/preview-workout";

const VOLUME_BARS = [10, 16, 20, 22, 26];

export function TodayScreen() {
  const router = useRouter();
  const live = useLiveSession();
  const session = PREVIEW_WORKOUT;

  function start() {
    startWorkout();
    router.push("/app/workout");
  }

  return (
    <AthleteAppShell active="Hoje">
      <div className="flex flex-col gap-5 px-6 pb-6 pt-4">
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">Olá, Lucas.</h1>
            <p className="text-sm text-muted">Veja seu dia.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/catalog/admin-avatar.webp"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border border-border object-cover"
          />
        </header>

        <section className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-brand">Treino de hoje</p>
            <span className="rounded-full bg-success/20 px-2.5 py-1 text-[11px] font-semibold text-success">
              Recuperação: Boa
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-foreground">{session.title}</h2>
            <p className="text-[13px] text-muted">{session.focus}</p>
          </div>
          <div className="flex gap-4 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <FigmaIcon src="/icons/clock.svg" alt="" size={16} className="text-muted" />
              {session.estimatedMinutes} min estimados
            </span>
            <span className="flex items-center gap-1.5">
              <FigmaIcon src="/icons/dumbbell.svg" alt="" size={16} className="text-muted" />
              {session.exercises.length} exercícios
            </span>
          </div>
          <button
            type="button"
            onClick={start}
            className="flex h-12 w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-[15px] font-bold text-on-brand"
          >
            {live.status === "active" || live.status === "resting" ? "Continuar treino" : "Iniciar treino"}
          </button>
        </section>

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
              <p className="text-2xl font-bold text-success">84%</p>
              <p className="text-xs text-muted">Pronto para alta carga</p>
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
              <p className="text-base font-bold text-foreground">2.450 / 3.100 kcal</p>
              <p className="text-xs text-muted">142g de proteína consumida</p>
            </div>
          </Link>
          <Link
            href="/app/body"
            className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold text-muted">Peso e Composição</p>
            <div className="flex items-baseline gap-2">
              <p className="text-[22px] font-bold text-foreground">78,4 kg</p>
              <span className="flex items-center gap-0.5 text-[11px] font-semibold text-success">
                <FigmaIcon src="/icons/trending-down.svg" alt="" size={12} className="text-success" />
                -0,3 kg
              </span>
            </div>
            <p className="text-[11px] text-tertiary">Massa gorda está em 12,4%</p>
          </Link>
          <Link
            href="/app/progress"
            className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4"
          >
            <p className="text-xs font-semibold text-muted">Volume Total de Carga</p>
            <div className="flex h-7 items-end gap-1">
              {VOLUME_BARS.map((height, index) => (
                <span
                  key={height}
                  className={`w-3.5 rounded-sm ${index >= 3 ? "bg-brand" : "bg-surface-pressed"}`}
                  style={{ height }}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted">+4,2% aumento esta semana</p>
          </Link>
        </div>

        <article className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">
            <FigmaIcon src="/icons/brain.svg" alt="" size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-bold uppercase text-brand">Mensagem do treinador</p>
            <p className="text-[13px] text-foreground">“Seu treino permanece conforme planejado.”</p>
          </div>
        </article>
      </div>
    </AthleteAppShell>
  );
}
