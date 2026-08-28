"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";
import type { AthleteSessionCard } from "@/lib/athlete/map-workout";

type TrainingData = { sessions: AthleteSessionCard[] };

function monthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7;
  const days: Date[] = [];
  for (let i = 0; i < startWeekday; i += 1) {
    days.push(new Date(year, month, i - startWeekday + 1));
  }
  const last = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= last; day += 1) {
    days.push(new Date(year, month, day));
  }
  while (days.length % 7 !== 0) {
    const extra = days.length - startWeekday - last + 1;
    days.push(new Date(year, month + 1, extra));
  }
  return days;
}

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function CalendarScreen() {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState<Date>(now);
  const training = useAdminQuery<TrainingData>("/api/me/training");
  const sessions = training.data?.sessions ?? [];
  const days = useMemo(() => monthDays(cursor.year, cursor.month), [cursor]);
  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const daySessions = sessions.filter((session) => {
    if (!session.scheduledAt) return false;
    return sameDay(new Date(session.scheduledAt), selected);
  });

  return (
    <AthleteAppShell active="Treino">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-foreground">Calendário</h1>
          <Link href="/app/plan" className="text-sm font-semibold text-brand">
            Plano
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-semibold text-brand"
            onClick={() =>
              setCursor((current) =>
                current.month === 0
                  ? { year: current.year - 1, month: 11 }
                  : { year: current.year, month: current.month - 1 },
              )
            }
          >
            Anterior
          </button>
          <p className="text-sm font-bold capitalize">{label}</p>
          <button
            type="button"
            className="text-sm font-semibold text-brand"
            onClick={() =>
              setCursor((current) =>
                current.month === 11
                  ? { year: current.year + 1, month: 0 }
                  : { year: current.year, month: current.month + 1 },
              )
            }
          >
            Próximo
          </button>
        </div>
        {training.loading ? <p className="text-sm text-muted">Consultando o banco…</p> : null}
        {training.error ? (
          <EmptyPanel title="Banco indisponível" body="O calendário só marca sessões gravadas." />
        ) : null}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth = day.getMonth() === cursor.month;
            const hasSession = sessions.some(
              (session) => session.scheduledAt && sameDay(new Date(session.scheduledAt), day),
            );
            const isSelected = sameDay(day, selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                className={`flex h-10 flex-col items-center justify-center rounded-[var(--radius-sm)] text-xs ${
                  isSelected
                    ? "bg-brand font-bold text-on-brand"
                    : inMonth
                      ? "text-foreground"
                      : "text-tertiary"
                }`}
              >
                {day.getDate()}
                {hasSession ? (
                  <span
                    className={`mt-0.5 size-1 rounded-full ${isSelected ? "bg-on-brand" : "bg-brand"}`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase text-muted">
            {selected.toLocaleDateString("pt-BR")}
          </h2>
          {daySessions.length === 0 ? (
            <EmptyPanel
              title="Nenhuma sessão neste dia"
              body="Grave um treino no plano para esta data. O calendário não inventa dias de treino."
            />
          ) : (
            daySessions.map((session) => (
              <Link
                key={session.id}
                href={`/app/workout?session=${session.id}`}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
              >
                <p className="font-semibold">{session.title}</p>
                <p className="text-xs text-muted">{session.exerciseCount} exercícios</p>
              </Link>
            ))
          )}
        </section>
      </div>
    </AthleteAppShell>
  );
}
