"use client";

import { useState } from "react";
import { ChoiceGroup } from "@/components/app/choice-group";
import {
  DIFFICULTY_OPTIONS,
  EXPECTATION_OPTIONS,
  PARTIAL_REASON_OPTIONS,
  PLAN_COMPLETION_OPTIONS,
  needsPartialReason,
  skippedPostWorkoutCheckout,
  type PartialReasonValue,
  type PlanCompletionValue,
  type PostWorkoutCheckout,
} from "@/domain/athlete-state/post-workout";
import { YES_NO } from "@/domain/athlete-state/pre-workout";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import { savePostWorkoutCheckout, trackProductEvent } from "@/lib/athlete-state/session-store";

export function PostWorkoutCheckoutCard({ onDone }: { onDone?: () => void }) {
  const [done, setDone] = useState(false);
  const [expectation, setExpectation] = useState<PostWorkoutCheckout["expectation"]>(null);
  const [difficulty, setDifficulty] = useState<PostWorkoutCheckout["difficulty"]>(null);
  const [completion, setCompletion] = useState<PlanCompletionValue | null>(null);
  const [reasons, setReasons] = useState<PartialReasonValue[]>([]);
  const [pain, setPain] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  async function skip() {
    if (saving) return;
    setSaving(true);
    await savePostWorkoutCheckout(skippedPostWorkoutCheckout());
    setDone(true);
    onDone?.();
  }

  async function submit() {
    if (saving) return;
    setSaving(true);
    await savePostWorkoutCheckout({
      status: "completed",
      expectation,
      difficulty,
      planCompletion: completion,
      partialReasons: reasons,
      hadPain: pain,
    });
    trackProductEvent("checkout_pos_treino_concluido");
    setDone(true);
    onDone?.();
  }

  function toggleReason(value: PartialReasonValue) {
    setReasons((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  }

  if (done) {
    return (
      <article className="rounded-[var(--radius-lg)] border border-success bg-success/20 p-4">
        <p className="text-sm font-bold text-foreground">Check-out concluído</p>
        <p className="text-xs text-muted">A sessão permanece registrada.</p>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-brand">FIGMA_UI_PENDING</p>
          <h2 className="text-sm font-bold text-foreground">{PRODUCT_NAMES.postWorkoutCheckout}</h2>
        </div>
        <button type="button" onClick={() => void skip()} className="text-xs font-semibold text-brand">
          Concluir sem responder
        </button>
      </div>

      <ChoiceGroup
        legend="Como foi o treino comparado ao que você esperava?"
        options={EXPECTATION_OPTIONS}
        value={expectation}
        onChange={setExpectation}
      />
      <ChoiceGroup legend="Como foi a dificuldade geral?" options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />
      <ChoiceGroup
        legend="Você conseguiu cumprir o planejado?"
        options={PLAN_COMPLETION_OPTIONS}
        value={completion}
        onChange={setCompletion}
      />
      {needsPartialReason(completion) ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-bold text-foreground">O que aconteceu?</legend>
          <p className="text-xs text-muted">Pode marcar mais de um motivo.</p>
          <div className="grid grid-cols-1 gap-2">
            {PARTIAL_REASON_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={reasons.includes(option.value)}
                onClick={() => toggleReason(option.value)}
                className={`flex min-h-11 items-center justify-center rounded-[var(--radius-lg)] border px-3 text-sm font-semibold ${
                  reasons.includes(option.value)
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <ChoiceGroup legend="Sentiu alguma dor ou desconforto durante o treino?" options={YES_NO} value={pain} onChange={setPain} columns={2} />

      <button
        type="button"
        disabled={saving}
        onClick={() => void submit()}
        className="flex h-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand text-sm font-bold text-on-brand"
      >
        Salvar check-out
      </button>
    </article>
  );
}
