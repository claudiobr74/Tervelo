"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Detail = {
  profile: {
    id: string;
    display_name: string;
    locale: string;
    created_at: string;
    theme_preference: string | null;
  } | null;
  athlete: {
    birth_date: string | null;
    sex: string | null;
    height_cm: number | string | null;
    experience_level: string | null;
  } | null;
  goals: { id: string; goal_type: string; status: string; notes: string | null }[];
  programs: { id: string; title: string; status: string; started_on: string | null }[];
  sessions: {
    id: string;
    status: string;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
  }[];
  measurements: {
    measured_at: string;
    weight_kg: number | string | null;
    body_fat_percent: number | string | null;
  }[];
};

export function AdminUserDetailScreen() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { loading, data, error } = useAdminQuery<Detail>(id ? `/api/admin/users/${id}` : "");

  return (
    <AdminShell active="Usuários" title={data?.profile?.display_name || "Atleta"}>
      <div className="flex flex-col gap-6">
        <Link href="/admin/users" className="text-sm font-semibold text-brand">
          Voltar à lista
        </Link>
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && !data?.profile}
          emptyTitle="Atleta não encontrado"
          emptyBody="Só abrimos contas que existem no banco."
        />
        {data?.profile ? (
          <>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-base font-bold">Perfil</h2>
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Nome</dt>
                  <dd>{data.profile.display_name || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Criado em</dt>
                  <dd>{new Date(data.profile.created_at).toLocaleString("pt-BR")}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Experiência</dt>
                  <dd>{data.athlete?.experience_level ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Altura</dt>
                  <dd>{data.athlete?.height_cm ? `${data.athlete.height_cm} cm` : "—"}</dd>
                </div>
              </dl>
            </section>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-base font-bold">Objetivos</h2>
              {data.goals.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Nenhum objetivo gravado.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {data.goals.map((goal) => (
                    <li key={goal.id} className="flex justify-between gap-2">
                      <span>{goal.goal_type}</span>
                      <span className="text-muted">{goal.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-base font-bold">Programas</h2>
              {data.programs.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Nenhum programa gravado.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {data.programs.map((program) => (
                    <li key={program.id} className="flex justify-between gap-2">
                      <span className="font-semibold">{program.title}</span>
                      <span className="text-muted">{program.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-base font-bold">Sessões</h2>
              {data.sessions.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Nenhuma sessão gravada.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {data.sessions.map((session) => (
                    <li key={session.id} className="flex justify-between gap-2">
                      <span>{session.status}</span>
                      <span className="text-muted">
                        {session.completed_at ?? session.started_at ?? session.scheduled_at ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-base font-bold">Medidas</h2>
              {data.measurements.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Nenhuma medida gravada.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {data.measurements.map((row) => (
                    <li key={row.measured_at} className="flex justify-between gap-2">
                      <span>{new Date(row.measured_at).toLocaleDateString("pt-BR")}</span>
                      <span className="text-muted">
                        {row.weight_kg ? `${row.weight_kg} kg` : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
