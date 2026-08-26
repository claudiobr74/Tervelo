"use client";

import { useRouter } from "next/navigation";
import { previewSession } from "@/lib/auth/local-preview";

async function persist(session: unknown) {
  await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(session) });
}

export function PhasePreviewLinks({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();

  async function openAdmin() {
    await persist(
      previewSession({ displayName: "Lucas Mendes", email: "lucas.admin@tervelo.local" }, "admin"),
    );
    router.push("/admin/exercises");
    router.refresh();
  }

  if (!hasSession) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-brand">Phase 6 — Treino</p>
      <div className="flex flex-wrap gap-3">
        <a
          href="/app/today"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-brand px-5 text-sm font-semibold text-on-brand"
        >
          Hoje
        </a>
        <a
          href="/app/workout"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-brand px-5 text-sm font-semibold text-brand"
        >
          Sessão de treino
        </a>
        <a
          href="/app/exercises"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-5 text-sm font-semibold text-foreground"
        >
          Busca de exercícios
        </a>
        <a
          href="/app/plates"
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-brand px-5 text-sm font-semibold text-brand"
        >
          Calculadora de anilhas
        </a>
        <button
          type="button"
          onClick={openAdmin}
          className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border px-5 text-sm font-semibold text-foreground"
        >
          Console admin (pré-visualização)
        </button>
      </div>
    </div>
  );
}
