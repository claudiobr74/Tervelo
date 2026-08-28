"use client";

import Link from "next/link";
import { useState } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { COACH_SUGGESTIONS, type CoachPreviewMessage } from "@/domain/ai/coach-preview";
import { getAthleteStateStore } from "@/lib/athlete-state/session-store";
import { useSyncStatus } from "@/components/app/sync-status-indicator";
import { SYNC_COPY } from "@/domain/offline";
import { adminRequest } from "@/lib/admin/http";

export function CoachScreen() {
  const sync = useSyncStatus();
  const [thread, setThread] = useState<CoachPreviewMessage[]>([]);
  const [busy, setBusy] = useState(false);

  async function ask(prompt: string) {
    const athlete: CoachPreviewMessage = {
      id: `q-${prompt}-${thread.length}`,
      role: "athlete",
      body: prompt,
    };
    if (!sync.online) {
      setThread((current) => [
        ...current,
        athlete,
        {
          id: `offline-${current.length}`,
          role: "coach",
          body: SYNC_COPY.coachUnavailable,
        },
      ]);
      return;
    }
    setBusy(true);
    const reason = getAthleteStateStore().todayAdjustment?.whyChanged ?? undefined;
    const result = await adminRequest<{ reply: CoachPreviewMessage; source: string }>(
      "/api/me/coach",
      {
        method: "POST",
        body: JSON.stringify({ prompt, sessionChangeReason: reason }),
      },
    );
    setBusy(false);
    if (!result.ok) {
      setThread((current) => [
        ...current,
        athlete,
        {
          id: `err-${current.length}`,
          role: "coach",
          body: "Não consegui consultar o banco agora. UNKNOWN — não vou inventar.",
        },
      ]);
      return;
    }
    const reply = result.data.reply;
    setThread((current) => [
      ...current,
      athlete,
      { ...reply, id: `${reply.id}-${current.length}` },
    ]);
  }

  return (
    <AthleteAppShell active="Coach">
      <header className="flex flex-col gap-1 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-foreground">Seu treinador</h1>
          <Link
            href="/app/coach/revisoes"
            className="text-xs font-bold text-brand"
            aria-label="Revisões Semanais do Coach"
          >
            Revisões
          </Link>
        </div>
        <p className="text-[13px] font-medium text-muted">
          Inteligência artificial focada em performance
        </p>
        {!sync.online ? (
          <p className="text-xs text-muted">{SYNC_COPY.coachAnalysisWhenOnline}</p>
        ) : (
          <p className="text-xs text-muted">
            As respostas usam treinos, medidas e check-ins gravados. Sem fato, o coach admite
            UNKNOWN.
          </p>
        )}
      </header>

      <div className="flex flex-wrap content-start gap-2 px-6">
        {COACH_SUGGESTIONS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => void ask(label)}
            disabled={busy}
            className="rounded-full border border-border bg-surface px-3.5 py-2 text-[11px] font-bold text-brand"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 pt-5">
        {thread.length === 0 ? (
          <EmptyPanel
            title="Ainda não há o que analisar"
            body="Quando houver treinos, medidas e check-ins seus, o coach responde com base nisso. Sem inventar carga, refeição ou atleta."
          />
        ) : null}
        {thread.map((message) =>
          message.role === "coach" ? (
            <CoachBubble key={message.id} message={message} />
          ) : (
            <AthleteBubble key={message.id} body={message.body} />
          ),
        )}
      </div>
    </AthleteAppShell>
  );
}

function CoachBubble({ message }: { message: CoachPreviewMessage }) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[16px] bg-brand-soft text-brand">
        <FigmaIcon src="/icons/brain.svg" size={16} />
      </span>
      <div className="min-w-0 flex-1 rounded-[12px] rounded-tl-none border border-border bg-surface p-3">
        <p className="text-[11px] font-bold text-brand">Coach TERVELO</p>
        <p className="mt-1 text-[13px] font-medium leading-normal text-foreground">
          {message.body}
        </p>
        {message.sections ? (
          <dl className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-[12px] leading-4">
            <Section label="Observação" value={message.sections.observacao} />
            <Section label="Interpretação" value={message.sections.interpretacao} />
            <Section label="Recomendação" value={message.sections.recomendacao} />
            <Section label="Papel da nutrição" value={message.sections.papelDaNutricao} />
            <Section label="Próxima reavaliação" value={message.sections.proximaReavaliacao} />
          </dl>
        ) : null}
      </div>
    </div>
  );
}

function AthleteBubble({ body }: { body: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[280px] rounded-[12px] rounded-tr-none bg-brand-soft px-3.5 py-2.5 text-[13px] font-medium leading-normal text-foreground">
        {body}
      </p>
    </div>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-muted">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
