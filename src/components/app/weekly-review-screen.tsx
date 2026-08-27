"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import { useAthleteStateStore, weeklyDecisionLabel } from "@/lib/athlete-state/session-store";

export function WeeklyReviewScreen() {
  const params = useParams<{ id: string }>();
  const store = useAthleteStateStore();
  const review = store.weeklyReviews.find((item) => item.id === params.id);

  if (!review) {
    return (
      <AthleteAppShell active="Coach">
        <div className="flex flex-col gap-4 px-6 pb-8 pt-4">
          <header className="flex items-center gap-3">
            <Link href="/app/coach/revisoes" aria-label="Voltar" className="text-foreground">
              <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
            </Link>
            <h1 className="text-xl font-extrabold text-foreground">{PRODUCT_NAMES.weeklyCoachReview}</h1>
          </header>
          <p className="text-sm text-muted">Esta revisão não está disponível neste dispositivo.</p>
        </div>
      </AthleteAppShell>
    );
  }

  return (
    <AthleteAppShell active="Coach">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <header className="flex items-center gap-3">
          <Link href="/app/coach/revisoes" aria-label="Voltar" className="text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase text-brand">{review.dateLabel}</p>
            <h1 className="text-xl font-extrabold text-foreground">{PRODUCT_NAMES.weeklyCoachReview}</h1>
          </div>
        </header>
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground">Sua semana</h2>
          <p className="text-xs font-semibold text-brand">{weeklyDecisionLabel(review.decision)}</p>
        </section>

        <Section title="Visão geral">{review.overview}</Section>
        <Section title="O que evoluiu">{review.whatImproved}</Section>
        <Section title="O que merece atenção">{review.whatNeedsAttention}</Section>
        <details className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-bold text-foreground">Treinamento</summary>
          <p className="mt-2 text-sm text-foreground">{review.training}</p>
        </details>
        <details className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-bold text-foreground">Nutrição</summary>
          <p className="mt-2 text-sm text-foreground">{review.nutrition}</p>
        </details>
        {review.body ? (
          <details className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-bold text-foreground">Corpo e Medidas</summary>
            <p className="mt-2 text-sm text-foreground">{review.body}</p>
          </details>
        ) : null}
        <details className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-bold text-foreground">Recuperação</summary>
          <p className="mt-2 text-sm text-foreground">{review.recovery}</p>
        </details>
        {review.heartRate ? (
          <details className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-bold text-foreground">Frequência cardíaca</summary>
            <p className="mt-2 text-sm text-foreground">{review.heartRate}</p>
          </details>
        ) : null}
        <Section title="Próxima semana">{review.nextWeek}</Section>
      </div>
    </AthleteAppShell>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <article className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="text-sm text-foreground">{children}</p>
    </article>
  );
}
