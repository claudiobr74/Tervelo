"use client";

import { useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { AI_AGENTS, agentLabel } from "@/domain/ai/agents";
import {
  AI_ADMIN_TABS,
  AI_AUTONOMY_ACTIONS,
  AI_AUTONOMY_LEVEL_LABEL,
  AI_AUTONOMY_LEVELS,
  AI_CONTRACT_PREVIEW,
  AI_GLOBAL_PRIORITIES,
  AI_IDENTITY_PROMPT,
  AI_SYSTEM_LOCKS,
  AI_TONES,
  DEFAULT_AI_ADMIN_TAB,
  DEFAULT_AI_AUTONOMY,
  DEFAULT_AI_TONES,
  type AiAdminTabId,
  type AiAutonomyActionId,
  type AiAutonomyLevel,
  type AiTone,
} from "@/domain/ai/contract";
import { selectAiAgent, useAiAdmin } from "@/lib/ai/preview-admin";
import {
  AGENT_CONFLICT_PRIORITY,
  INTEGRATED_OUTPUT_SECTIONS,
  LONGITUDINAL_SYSTEM,
} from "@/domain/ai/nutrition-context";
import { QA_ADDENDUM_CHECKS } from "@/domain/ai/qa-addendum";

const PENDING_COPY: Record<Exclude<AiAdminTabId, "behavior" | "nutrition">, string> = {
  training: "As heurísticas de treino entram nesta aba em breve.",
  recovery: "As heurísticas de recuperação entram nesta aba em breve.",
  safety: "As políticas de segurança são definidas no código e aparecerão aqui em breve.",
  models: "A escolha de modelo roda no servidor. A configuração chega aqui em breve.",
  tests: "A bateria de testes do contrato chega em breve.",
  versioning: "O histórico de versões publicadas chega em breve.",
};

function pillClass(active: boolean): string {
  return active
    ? "rounded-full border border-brand bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand"
    : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted";
}

function AutonomyDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={selected ? "size-3 rounded-full bg-brand" : "size-2 rounded-full bg-border-strong"}
    />
  );
}

function AddendumNutritionPanel() {
  return (
    <div className="flex flex-col gap-4">
      <article className="rounded-[var(--radius-xl)] border border-brand bg-brand-soft p-5">
        <p className="text-xs font-bold uppercase text-brand">TERVELO — ADDENDUM</p>
        <h2 className="mt-1 text-lg font-extrabold">
          Integração obrigatória entre treinamento e nutrição esportiva
        </h2>
        <p className="mt-2 text-sm text-foreground">
          Complementa o prompt mestre. Não substitui as regras anteriores, não reduz o Sports
          Nutrition Coach e não altera as regras protegidas de segurança.
        </p>
        <p className="mt-3 text-sm font-semibold uppercase text-foreground">
          {LONGITUDINAL_SYSTEM.join(" ↔ ")}
        </p>
      </article>
      <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h3 className="text-sm font-bold">Princípio fundamental</h3>
        <p className="mt-2 text-sm text-muted">
          Dados ausentes permanecem UNKNOWN. Nunca estimar silenciosamente. O Daily Coach considera
          NUTRITION_CONTEXT antes de reduzir volume, carga ou frequência. Não afirmar causalidade
          quando houver apenas associação.
        </p>
      </article>
      <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h3 className="text-sm font-bold">QA Auditor — checks 13 a 20</h3>
        <ol className="mt-3 flex flex-col gap-1.5 text-[13px] text-foreground">
          {QA_ADDENDUM_CHECKS.map((check) => (
            <li key={check.id}>
              {check.id}. {check.label}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted">Conflito grave entre agentes → FAIL.</p>
      </article>
      <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h3 className="text-sm font-bold">Output quando a nutrição influencia a decisão</h3>
        <p className="mt-2 text-sm text-muted">{INTEGRATED_OUTPUT_SECTIONS.join(" → ")}</p>
        <p className="mt-3 text-xs text-muted">
          Prioridade em conflito: {AGENT_CONFLICT_PRIORITY.join("; ")}.
        </p>
      </article>
    </div>
  );
}

export function AdminAiScreen() {
  const { selectedAgent } = useAiAdmin();
  const [tab, setTab] = useState<AiAdminTabId>(DEFAULT_AI_ADMIN_TAB);
  const [identity, setIdentity] = useState(AI_IDENTITY_PROMPT);
  const [tones, setTones] = useState<readonly AiTone[]>(DEFAULT_AI_TONES);
  const [autonomy, setAutonomy] = useState(DEFAULT_AI_AUTONOMY);

  function toggleTone(tone: AiTone) {
    setTones((current) =>
      current.includes(tone) ? current.filter((item) => item !== tone) : [...current, tone],
    );
  }

  function setLevel(action: AiAutonomyActionId, level: AiAutonomyLevel) {
    setAutonomy((current) => ({ ...current, [action]: level }));
  }

  const activeTab = AI_ADMIN_TABS.find((item) => item.id === tab) ?? AI_ADMIN_TABS[0];

  return (
    <AdminShell title="Inteligência Artificial" active="Inteligência Artificial">
      <div className="flex flex-col items-stretch gap-6 xl:flex-row xl:items-start">
        <nav
          aria-label="Seções do contrato"
          className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto xl:w-[220px] xl:flex-col"
        >
          {AI_ADMIN_TABS.map((item) => {
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`shrink-0 whitespace-nowrap rounded-[var(--radius-md)] px-4 py-3 text-left text-sm ${
                  selected ? "bg-surface-secondary font-bold text-brand" : "font-medium text-muted"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <article className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-lg font-extrabold">Contrato da Inteligência Artificial</h2>
              <p className="text-[13px] text-muted">
                Edite o comportamento e as heurísticas padrão adotadas pela IA da Tervelo.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <span className="rounded-full bg-success/20 px-2.5 py-1 text-xs font-bold text-success">
                {AI_CONTRACT_PREVIEW.version} — {AI_CONTRACT_PREVIEW.stateLabel}
              </span>
              <button
                type="button"
                title="Orquestração real depois da UI. Sem modelo nesta pré-visualização."
                className="rounded-[var(--radius-md)] bg-surface-secondary px-4 py-2 text-[13px] font-semibold text-foreground"
              >
                Testar versão
              </button>
              <button
                type="button"
                title="Comparação de versões entra com ai_contract_versions"
                className="rounded-[var(--radius-md)] bg-brand px-4 py-2 text-[13px] font-semibold text-on-brand"
              >
                Comparar versões
              </button>
            </div>
          </article>

          {tab === "behavior" ? (
            <div className="flex flex-col items-stretch gap-4 xl:flex-row xl:items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                <section className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold">Agente de IA</h3>
                  <p className="text-[13px] text-muted">
                    Escolha operacional no modo administrar. O pipeline permanece o do contrato; a
                    seleção define o agente em foco nesta pré-visualização.
                  </p>
                  <p className="text-[13px] text-foreground">
                    Agente ativo: <span className="font-semibold">{agentLabel(selectedAgent)}</span>
                  </p>
                  <div role="radiogroup" aria-label="Agente de IA" className="flex flex-wrap gap-2">
                    {AI_AGENTS.map((agent) => {
                      const active = agent.id === selectedAgent;
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => selectAiAgent(agent.id)}
                          className={pillClass(active)}
                        >
                          {agent.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="flex flex-col gap-2">
                  <label htmlFor="ai-identity" className="text-sm font-bold">
                    Identidade e Papel Base
                  </label>
                  <textarea
                    id="ai-identity"
                    value={identity}
                    onChange={(event) => setIdentity(event.target.value)}
                    rows={4}
                    className="resize-none rounded-[var(--radius-md)] border border-border bg-background p-3 text-[13px] leading-[18px] text-foreground outline-none focus-visible:border-brand"
                  />
                </section>

                <section className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold">Prioridades Globais</h3>
                  <ol className="flex flex-col gap-1.5">
                    {AI_GLOBAL_PRIORITIES.map((priority) => (
                      <li
                        key={priority}
                        className="rounded-[var(--radius-sm)] bg-background px-3 py-2 text-[13px] text-foreground"
                      >
                        {priority}
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold">Tom de Comunicação Principal</h3>
                  <div className="flex flex-wrap gap-2">
                    {AI_TONES.map((tone) => {
                      const active = tones.includes(tone);
                      return (
                        <button
                          key={tone}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleTone(tone)}
                          className={pillClass(active)}
                        >
                          {tone}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="flex w-full min-w-0 shrink-0 flex-col gap-4 xl:w-[min(100%,420px)]">
                <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                  <h3 className="text-sm font-bold">Matriz de Autonomia da IA</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 border-b border-border pb-1 text-[11px] font-bold text-muted">
                      <span className="min-w-0 flex-1">Ação</span>
                      {AI_AUTONOMY_LEVELS.map((level) => (
                        <span key={level} className="w-[70px] text-center">
                          {AI_AUTONOMY_LEVEL_LABEL[level]}
                        </span>
                      ))}
                    </div>
                    {AI_AUTONOMY_ACTIONS.map((action) => (
                      <div
                        key={action.id}
                        role="radiogroup"
                        aria-label={action.label}
                        className="flex items-center gap-2"
                      >
                        <span className="min-w-0 flex-1 text-xs text-foreground">
                          {action.label}
                        </span>
                        {AI_AUTONOMY_LEVELS.map((level) => {
                          const selected = autonomy[action.id] === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              aria-label={`${action.label}: ${AI_AUTONOMY_LEVEL_LABEL[level]}`}
                              onClick={() => setLevel(action.id, level)}
                              className="flex h-3 w-[70px] items-center justify-center"
                            >
                              <AutonomyDot selected={selected} />
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-error bg-error/10 p-5">
                  <div className="flex items-center gap-2">
                    <FigmaIcon
                      src="/icons/admin/lock.svg"
                      alt=""
                      size={16}
                      className="text-error"
                    />
                    <h3 className="text-sm font-bold">Regras Protegidas do Sistema</h3>
                  </div>
                  <p className="text-xs text-muted">
                    Estas diretrizes fundamentais estão travadas no código core da plataforma e
                    nunca são sobrescritas pela IA.
                  </p>
                  <ul className="flex flex-col gap-1.5 text-[11px] text-foreground">
                    {AI_SYSTEM_LOCKS.map((rule) => (
                      <li key={rule}>• {rule}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          ) : tab === "nutrition" ? (
            <AddendumNutritionPanel />
          ) : (
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-lg font-extrabold">{activeTab.label}</h2>
              <p className="mt-2 text-sm text-muted">
                {PENDING_COPY[tab as Exclude<AiAdminTabId, "behavior" | "nutrition">]}
              </p>
            </article>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
