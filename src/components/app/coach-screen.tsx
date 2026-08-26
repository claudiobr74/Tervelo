"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import {
  COACH_SUGGESTIONS,
  coachProposalFeedback,
  coachReplyForPrompt,
  previewCoachFacts,
  type CoachPreviewMessage,
} from "@/domain/ai/coach-preview";
import {
  getCoachProposalSnapshot,
  setCoachProposalStatus,
  subscribeCoachProposal,
} from "@/lib/coach-proposal-store";

const OPENING: CoachPreviewMessage = {
  id: "opening",
  role: "coach",
  body: "Notei uma excelente progressão de força no Supino Reto na sua última sessão. Proponho um ajuste para manter o estímulo hipertrófico correto.",
};

export function CoachScreen() {
  const proposal = useSyncExternalStore(
    subscribeCoachProposal,
    getCoachProposalSnapshot,
    getCoachProposalSnapshot,
  );
  const [thread, setThread] = useState<CoachPreviewMessage[]>([OPENING]);
  const proposalCopy = useMemo(
    () => coachProposalFeedback(proposal.status),
    [proposal.status],
  );

  function ask(prompt: string) {
    const athlete: CoachPreviewMessage = {
      id: `q-${prompt}`,
      role: "athlete",
      body: prompt,
    };
    const reply = coachReplyForPrompt(prompt, previewCoachFacts);
    setThread((current) => [...current, athlete, { ...reply, id: `${reply.id}-${current.length}` }]);
  }

  return (
    <AthleteAppShell active="Coach">
      <header className="flex flex-col gap-1 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-foreground">Seu treinador</h1>
          <button
            type="button"
            title="FIGMA_PENDING"
            className="inline-flex size-6 shrink-0 items-center justify-center text-foreground"
            aria-label="Menu do treinador"
          >
            <FigmaIcon src="/icons/nav/mais.svg" size={24} />
          </button>
        </div>
        <p className="text-[13px] font-medium text-muted">
          Inteligência artificial focada em performance
        </p>
      </header>

      <div className="flex flex-wrap content-start gap-2 px-6">
        {COACH_SUGGESTIONS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => ask(label)}
            className="rounded-full border border-border bg-surface px-3.5 py-2 text-[11px] font-bold text-brand"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 pt-5">
        {thread.map((message) =>
          message.role === "coach" ? (
            <CoachBubble key={message.id} message={message} />
          ) : (
            <AthleteBubble key={message.id} body={message.body} />
          ),
        )}

        <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-brand bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase text-brand">Mudança proposta</p>
            <span className="rounded-[4px] bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand">
              Sugerido
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-bold text-foreground">Supino Reto</p>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-muted line-through">80kg</span>
              <FigmaIcon src="/icons/coach-arrow.svg" size={14} className="text-brand" />
              <span className="text-[14px] font-bold text-brand">82kg</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-muted">
            Motivo: Você completou todas as séries mantendo boa margem de execução e 2 repetições em
            reserva.
          </p>
          {proposalCopy ? (
            <p className="text-[12px] font-semibold text-success">{proposalCopy}</p>
          ) : null}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCoachProposalStatus("accepted")}
              className="flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand text-[14px] font-bold text-on-brand"
            >
              Aceitar alteração
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCoachProposalStatus("kept")}
                className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface text-[11px] font-bold text-muted"
              >
                Manter como está
              </button>
              <Link
                href="/app/coach/ajuste"
                className="flex h-9 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface text-[11px] font-bold text-muted"
              >
                Quero entender
              </Link>
            </div>
          </div>
        </article>
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
        <p className="mt-1 text-[13px] font-medium leading-normal text-foreground">{message.body}</p>
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
