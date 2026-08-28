"use client";

import { useEffect, useMemo, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { AI_AGENTS, agentLabel } from "@/domain/ai/agents";
import {
  AI_ADMIN_TABS,
  AI_AUTONOMY_ACTIONS,
  AI_AUTONOMY_LEVEL_LABEL,
  AI_AUTONOMY_LEVELS,
  AI_GLOBAL_PRIORITIES,
  AI_POLICY_LOCKS,
  AI_SYSTEM_LOCKS,
  AI_TONES,
  DEFAULT_AI_ADMIN_TAB,
  type AiAdminTabId,
  type AiAutonomyActionId,
  type AiAutonomyLevel,
  type AiTone,
} from "@/domain/ai/contract";
import { DEFAULT_AI_CONTRACT_CONFIG, type AiContractConfig } from "@/domain/ai/contract-config";
import {
  AGENT_CONFLICT_PRIORITY,
  INTEGRATED_OUTPUT_SECTIONS,
  LONGITUDINAL_SYSTEM,
} from "@/domain/ai/nutrition-context";
import { QA_ADDENDUM_CHECKS } from "@/domain/ai/qa-addendum";
import { QA_HEART_RATE_CHECKS } from "@/domain/heart-rate/qa";
import { QA_ATHLETE_STATE_CHECKS } from "@/domain/athlete-state/qa";
import { adminRequest } from "@/lib/admin/http";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type Version = {
  id: string;
  version: number;
  state: string;
  changeSummary: string | null;
  createdAt: string;
  config: AiContractConfig;
};

type AiPayload = {
  slug: string;
  contractId: string | null;
  superAdmin: boolean;
  fromDatabase: boolean;
  config: AiContractConfig;
  latest: { id: string; version: number; state: string; createdAt: string } | null;
  published: { id: string; version: number; state: string; createdAt: string } | null;
  versions: Version[];
};

function writeErrorCopy(error: string | undefined): string {
  if (error === "forbidden") return "Só super_admin grava e publica o contrato.";
  if (error === "nhost_unavailable") return "Sem banco para gravar o contrato.";
  if (error === "not_found") return "O contrato ainda não existe no banco.";
  return "Não gravou no banco.";
}

function pillClass(active: boolean): string {
  return active
    ? "rounded-full border border-brand bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand"
    : "rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted";
}

function QaPanel({
  title,
  intro,
  checks,
}: {
  title: string;
  intro: string;
  checks: readonly { id: number; label: string }[];
}) {
  return (
    <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{intro}</p>
      <ol className="mt-3 flex flex-col gap-1.5 text-[13px] text-foreground">
        {checks.map((check) => (
          <li key={check.id}>
            {check.id}. {check.label}
          </li>
        ))}
      </ol>
    </article>
  );
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
          NUTRITION_CONTEXT antes de reduzir volume, carga ou frequência.
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
  const { loading, data, error, reload } = useAdminQuery<AiPayload>("/api/admin/ai");
  const [tab, setTab] = useState<AiAdminTabId>(DEFAULT_AI_ADMIN_TAB);
  const [config, setConfig] = useState<AiContractConfig>(DEFAULT_AI_CONTRACT_CONFIG);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string>("");

  useEffect(() => {
    if (data && !hydrated) {
      setConfig(data.config);
      setHydrated(true);
    }
  }, [data, hydrated]);

  const publishedLabel = data?.published
    ? `v${data.published.version} publicada`
    : data?.latest
      ? `v${data.latest.version} ${data.latest.state}`
      : "sem versão no banco";
  const canWrite = Boolean(data?.superAdmin);

  function patch(partial: Partial<AiContractConfig>) {
    setConfig((current) => ({ ...current, ...partial }));
  }

  async function saveDraft() {
    setStatus(null);
    const result = await adminRequest("/api/admin/ai", {
      method: "POST",
      body: JSON.stringify({ config, changeSummary: "Rascunho pelo painel" }),
    });
    setStatus(
      result.ok ? "Rascunho gravado em ai_contract_versions." : writeErrorCopy(result.error),
    );
    if (result.ok) {
      setHydrated(false);
      await reload();
    }
  }

  async function publish() {
    setStatus(null);
    const versionId = data?.latest?.id ?? data?.published?.id;
    if (!versionId) {
      setStatus("Grave um rascunho antes de publicar.");
      return;
    }
    const result = await adminRequest("/api/admin/ai/publish", {
      method: "POST",
      body: JSON.stringify({ versionId, environment: "production" }),
    });
    setStatus(result.ok ? "Contrato publicado em produção." : writeErrorCopy(result.error));
    if (result.ok) {
      setHydrated(false);
      await reload();
    }
  }

  async function testVersion() {
    setStatus(null);
    const result = await adminRequest<{ message: string; persisted: boolean }>(
      "/api/admin/ai/test",
      {
        method: "POST",
        body: JSON.stringify({ config }),
      },
    );
    if (!result.ok) {
      setStatus("Não testou o contrato.");
      return;
    }
    setStatus(result.data.message);
  }

  const compared = useMemo(
    () => data?.versions.find((row) => row.id === compareId) ?? null,
    [compareId, data],
  );

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
            <div>
              <h2 className="text-lg font-extrabold">Contrato da Inteligência Artificial</h2>
              <p className="mt-1 text-[13px] text-muted">
                Slug {data?.slug ?? "default-athlete-coach"}. {publishedLabel}.{" "}
                {data?.fromDatabase
                  ? "Configuração lida de ai_contract_versions."
                  : "Padrão do produto até existir versão no banco."}{" "}
                Grava em ai_contracts / ai_contract_versions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void testVersion()}
                className="rounded-[var(--radius-md)] bg-surface-secondary px-4 py-2 text-[13px] font-semibold"
              >
                Testar versão
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={!canWrite}
                className="rounded-[var(--radius-md)] border border-brand px-4 py-2 text-[13px] font-semibold text-brand disabled:opacity-50"
              >
                Gravar rascunho
              </button>
              <button
                type="button"
                onClick={() => void publish()}
                disabled={!canWrite}
                className="rounded-[var(--radius-md)] bg-brand px-4 py-2 text-[13px] font-bold text-on-brand disabled:opacity-50"
              >
                Publicar
              </button>
            </div>
          </article>
          {status ? <p className="text-sm">{status}</p> : null}
          <AdminStatusPanel
            loading={loading}
            error={error}
            empty={false}
            emptyTitle=""
            emptyBody=""
          />

          {tab === "behavior" ? (
            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                <section className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold">Agente de IA</h3>
                  <p className="text-[13px] text-foreground">
                    Agente ativo:{" "}
                    <span className="font-semibold">{agentLabel(config.selectedAgent)}</span>
                  </p>
                  <div role="radiogroup" aria-label="Agente de IA" className="flex flex-wrap gap-2">
                    {AI_AGENTS.map((agent) => (
                      <button
                        key={agent.id}
                        type="button"
                        role="radio"
                        aria-checked={agent.id === config.selectedAgent}
                        onClick={() => patch({ selectedAgent: agent.id })}
                        className={pillClass(agent.id === config.selectedAgent)}
                      >
                        {agent.label}
                      </button>
                    ))}
                  </div>
                </section>
                <section className="flex flex-col gap-2">
                  <label htmlFor="ai-identity" className="text-sm font-bold">
                    Identidade e Papel Base
                  </label>
                  <textarea
                    id="ai-identity"
                    value={config.identity}
                    onChange={(event) => patch({ identity: event.target.value })}
                    rows={4}
                    className="resize-none rounded-[var(--radius-md)] border border-border bg-background p-3 text-[13px] outline-none focus-visible:border-brand"
                  />
                </section>
                <section className="flex flex-col gap-2">
                  <h3 className="text-sm font-bold">Prioridades Globais</h3>
                  <ol className="flex flex-col gap-1.5">
                    {AI_GLOBAL_PRIORITIES.map((priority) => (
                      <li
                        key={priority}
                        className="rounded-[var(--radius-sm)] bg-background px-3 py-2 text-[13px]"
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
                      const active = config.tones.includes(tone);
                      return (
                        <button
                          key={tone}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            patch({
                              tones: active
                                ? config.tones.filter((item) => item !== tone)
                                : [...config.tones, tone],
                            })
                          }
                          className={pillClass(active)}
                        >
                          {tone}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
              <div className="flex w-full min-w-0 flex-col gap-4 xl:w-[min(100%,420px)]">
                <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                  <h3 className="text-sm font-bold">Matriz de Autonomia da IA</h3>
                  {AI_AUTONOMY_ACTIONS.map((action) => (
                    <div
                      key={action.id}
                      role="radiogroup"
                      aria-label={action.label}
                      className="flex items-center gap-2"
                    >
                      <span className="min-w-0 flex-1 text-xs">{action.label}</span>
                      {AI_AUTONOMY_LEVELS.map((level) => {
                        const selected = config.autonomy[action.id as AiAutonomyActionId] === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`${action.label}: ${AI_AUTONOMY_LEVEL_LABEL[level]}`}
                            onClick={() =>
                              patch({
                                autonomy: {
                                  ...config.autonomy,
                                  [action.id]: level as AiAutonomyLevel,
                                },
                              })
                            }
                            className="flex h-3 w-[70px] items-center justify-center"
                          >
                            <AutonomyDot selected={selected} />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </article>
                <article className="rounded-[var(--radius-xl)] border border-error bg-error/10 p-5">
                  <div className="flex items-center gap-2">
                    <FigmaIcon
                      src="/icons/admin/lock.svg"
                      alt=""
                      size={16}
                      className="text-error"
                    />
                    <h3 className="text-sm font-bold">Regras Protegidas do Sistema</h3>
                  </div>
                  <ul className="mt-3 flex flex-col gap-1.5 text-[11px]">
                    {AI_SYSTEM_LOCKS.map((rule) => (
                      <li key={rule}>• {rule}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          ) : null}

          {tab === "training" ? (
            <article className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-lg font-extrabold">Heurísticas de treino</h2>
              {(
                [
                  ["loadProgression", "Progressão de carga"],
                  ["volume", "Volume"],
                  ["intensity", "Intensidade"],
                  ["proximityToFailure", "Proximidade da falha"],
                  ["deload", "Deload"],
                  ["frequency", "Frequência"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-sm font-semibold">
                  {label}
                  <textarea
                    value={config.training[key]}
                    onChange={(event) =>
                      patch({ training: { ...config.training, [key]: event.target.value } })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background p-3 text-[13px] font-normal"
                  />
                </label>
              ))}
            </article>
          ) : null}

          {tab === "nutrition" ? (
            <div className="flex flex-col gap-4">
              <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                <h2 className="text-lg font-extrabold">Controles persistidos</h2>
                <p className="mt-2 text-sm text-muted">
                  Estes interruptores entram no jsonb do contrato. As regras protegidas abaixo não
                  desligam.
                </p>
                <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={config.nutrition.considerBeforeVolumeCut}
                    onChange={(event) =>
                      patch({
                        nutrition: {
                          ...config.nutrition,
                          considerBeforeVolumeCut: event.target.checked,
                        },
                      })
                    }
                  />
                  Considerar nutrição antes de cortar volume
                </label>
                <label className="mt-2 flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={config.nutrition.unknownStaysUnknown}
                    onChange={(event) =>
                      patch({
                        nutrition: {
                          ...config.nutrition,
                          unknownStaysUnknown: event.target.checked,
                        },
                      })
                    }
                  />
                  Dado ausente permanece UNKNOWN
                </label>
              </article>
              <AddendumNutritionPanel />
            </div>
          ) : null}

          {tab === "recovery" ? (
            <div className="flex flex-col gap-4">
              <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
                <h2 className="text-lg font-extrabold">Frequência cardíaca</h2>
                <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={config.recovery.heartRateComplementary}
                    onChange={(event) =>
                      patch({
                        recovery: { heartRateComplementary: event.target.checked },
                      })
                    }
                  />
                  Frequência cardíaca é complementar, nunca manda sozinha
                </label>
              </article>
              <QaPanel
                title="Recuperação"
                intro="Frequência cardíaca é complementar. O contrato grava isso; o código não deixa a FC mandar sozinha."
                checks={QA_HEART_RATE_CHECKS}
              />
            </div>
          ) : null}

          {tab === "safety" ? (
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-lg font-extrabold">Políticas que o contrato não desliga</h2>
              <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
                {AI_POLICY_LOCKS.map((rule) => (
                  <li key={rule}>• {rule}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {tab === "models" ? (
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-lg font-extrabold">Modelo</h2>
              <p className="mt-2 text-sm text-muted">
                A chave do modelo nunca entra no navegador. Aqui só o identificador que o servidor
                usa.
              </p>
              <label className="mt-3 block text-sm font-semibold">
                Identificador
                <input
                  value={config.models.primary}
                  onChange={(event) => patch({ models: { primary: event.target.value } })}
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 font-normal"
                />
              </label>
            </article>
          ) : null}

          {tab === "tests" ? (
            <QaPanel
              title="QA Auditor — checks 31 a 44"
              intro="Estado do Atleta, check-ins e revisão semanal. Sem nota de prontidão 0 a 100."
              checks={QA_ATHLETE_STATE_CHECKS}
            />
          ) : null}

          {tab === "versioning" ? (
            <article className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
              <h2 className="text-lg font-extrabold">Versionamento</h2>
              {(data?.versions.length ?? 0) === 0 ? (
                <p className="mt-2 text-sm text-muted">Nenhuma versão em ai_contract_versions.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {data?.versions.map((row) => (
                    <li key={row.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        v{row.version} · {row.state}
                      </span>
                      <button
                        type="button"
                        className="text-brand"
                        onClick={() => setCompareId(row.id)}
                      >
                        Comparar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {compared ? (
                <pre className="mt-4 overflow-auto rounded bg-background p-3 text-xs">
                  {JSON.stringify(compared.config, null, 2)}
                </pre>
              ) : null}
            </article>
          ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
