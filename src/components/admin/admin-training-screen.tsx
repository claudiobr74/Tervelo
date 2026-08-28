"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type TrainingData = {
  training_programs: {
    id: string;
    user_id: string;
    title: string;
    status: string;
    started_on: string | null;
    source: string | null;
    updated_at: string;
  }[];
  training_sessions: {
    id: string;
    user_id: string;
    status: string;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
  }[];
};

export function AdminTrainingScreen() {
  const { loading, data, error } = useAdminQuery<TrainingData>("/api/admin/training");
  const programs = data?.training_programs ?? [];
  const sessions = data?.training_sessions ?? [];

  return (
    <AdminShell
      active="Treinamento"
      title="Treinamento"
      subtitle="Programas e sessões gravados no banco. Sem atleta, a lista fica vazia."
    >
      <div className="flex flex-col gap-6">
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && programs.length === 0 && sessions.length === 0}
          emptyTitle="Nenhum programa no banco"
          emptyBody="O acionamento de treino lê training_programs e training_sessions. Nada é inventado."
        />
        {programs.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-bold">Programas</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {programs.map((program) => (
                <li key={program.id} className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-semibold">{program.title || "Programa sem título"}</span>
                  <span className="text-muted">
                    {program.status}
                    {program.started_on ? ` · ${program.started_on}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {sessions.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-bold">Sessões</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {sessions.map((session) => (
                <li key={session.id} className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>{session.status}</span>
                  <span className="text-muted">
                    {session.completed_at ?? session.started_at ?? session.scheduled_at ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
