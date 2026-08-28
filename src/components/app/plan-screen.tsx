"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";
import type { CatalogExercise } from "@/domain/exercise/search";
import type { AthleteSessionCard } from "@/lib/athlete/map-workout";

type TrainingData = {
  programs: { id: string; title: string; status: string; started_on: string | null }[];
  sessions: AthleteSessionCard[];
};

type CatalogData = { exercises: CatalogExercise[]; equipment: unknown[] };

function localDateTimeValue(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PlanScreen() {
  const training = useAdminQuery<TrainingData>("/api/me/training");
  const catalog = useAdminQuery<CatalogData>("/api/me/catalog");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(localDateTimeValue());
  const [catalogQuery, setCatalogQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const exercises = catalog.data?.exercises ?? [];
  const sessions = training.data?.sessions ?? [];
  const programs = training.data?.programs ?? [];

  const selectedExercises = useMemo(
    () => exercises.filter((item) => selected.includes(item.id)),
    [exercises, selected],
  );
  const visibleExercises = useMemo(() => {
    const needle = catalogQuery.trim().toLocaleLowerCase("pt-BR");
    if (!needle) return exercises;
    return exercises.filter(
      (item) =>
        item.namePt.toLocaleLowerCase("pt-BR").includes(needle) ||
        item.primaryMuscle.toLocaleLowerCase("pt-BR").includes(needle),
    );
  }, [exercises, catalogQuery]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function createPlan() {
    setMessage(null);
    if (selectedExercises.length === 0) {
      setMessage("Escolha pelo menos um exercício do catálogo.");
      return;
    }
    const scheduled = new Date(scheduledAt);
    if (Number.isNaN(scheduled.getTime())) {
      setMessage("Informe data e hora válidas.");
      return;
    }
    const result = await adminRequest("/api/me/training", {
      method: "POST",
      body: JSON.stringify({
        title,
        scheduledAt: scheduled.toISOString(),
        exercises: selectedExercises.map((exercise) => ({
          namePt: exercise.namePt,
          canonicalExerciseId: exercise.id,
        })),
      }),
    });
    if (!result.ok) {
      setMessage(
        result.error === "nhost_unavailable"
          ? "Sem banco para gravar o plano."
          : "Não gravou o plano.",
      );
      return;
    }
    setTitle("");
    setSelected([]);
    await training.reload();
  }

  return (
    <AthleteAppShell active="Treino">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-foreground">Plano de treino</h1>
          <Link href="/app/calendar" className="text-sm font-semibold text-brand">
            Calendário
          </Link>
        </div>
        {training.loading ? <p className="text-sm text-muted">Consultando o banco…</p> : null}
        {training.error ? (
          <EmptyPanel title="Banco indisponível" body="O plano só lista sessões gravadas." />
        ) : null}
        {!training.loading && !training.error && sessions.length === 0 ? (
          <EmptyPanel
            title="Nenhuma sessão prescrita"
            body="Monte um treino com exercícios do catálogo. Nada é inventado."
          />
        ) : null}
        {programs.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase text-muted">Programas</h2>
            <ul className="flex flex-col gap-2">
              {programs.map((program) => (
                <li
                  key={program.id}
                  className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
                >
                  <p className="font-semibold">{program.title}</p>
                  <p className="text-xs text-muted">{program.status}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {sessions.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-bold uppercase text-muted">Sessões</h2>
            <ul className="flex flex-col gap-2">
              {sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/app/workout?session=${session.id}`}
                    className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
                  >
                    <p className="font-semibold">{session.title}</p>
                    <p className="text-xs text-muted">
                      {session.exerciseCount} exercícios
                      {session.scheduledAt
                        ? ` · ${new Date(session.scheduledAt).toLocaleString("pt-BR")}`
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void createPlan();
          }}
        >
          <h2 className="text-base font-bold">Nova sessão</h2>
          <label className="text-sm font-semibold">
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-semibold">
            Quando
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold">Exercícios do catálogo</legend>
            {catalog.loading ? <p className="text-sm text-muted">Carregando catálogo…</p> : null}
            {!catalog.loading && exercises.length === 0 ? (
              <p className="text-sm text-muted">
                A biblioteca autorizada ainda não está neste ambiente.
              </p>
            ) : null}
            {exercises.length > 0 ? (
              <input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                aria-label="Filtrar exercícios do catálogo"
                placeholder="Filtrar pela biblioteca"
                className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm"
              />
            ) : null}
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {(catalogQuery.trim() ? visibleExercises : visibleExercises.slice(0, 40)).map(
                (exercise) => (
                  <label key={exercise.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected.includes(exercise.id)}
                      onChange={() => toggle(exercise.id)}
                    />
                    {exercise.namePt}
                  </label>
                ),
              )}
            </div>
          </fieldset>
          <button type="submit" className={PRIMARY_CTA_CLASS}>
            Gravar sessão
          </button>
          {message ? <p className="text-sm text-error">{message}</p> : null}
        </form>
      </div>
    </AthleteAppShell>
  );
}
