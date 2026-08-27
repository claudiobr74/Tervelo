"use client";

import Link from "next/link";
import { AthleteAppShell } from "@/components/app/athlete-shell";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRODUCT_NAMES } from "@/domain/athlete-state/labels";
import { trackProductEvent, useAthleteStateStore, weeklyDecisionLabel } from "@/lib/athlete-state/session-store";

export function WeeklyReviewsListScreen() {
  const store = useAthleteStateStore();

  return (
    <AthleteAppShell active="Coach">
      <div className="flex flex-col gap-5 px-6 pb-8 pt-4">
        <header className="flex items-center gap-3">
          <Link href="/app/coach" aria-label="Voltar" className="text-foreground">
            <FigmaIcon src="/icons/arrow-left.svg" alt="" size={24} />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase text-brand">Coach</p>
            <h1 className="text-xl font-extrabold text-foreground">Revisões</h1>
          </div>
        </header>
        <p className="text-xs text-muted">FIGMA_UI_PENDING · {PRODUCT_NAMES.weeklyCoachReview}</p>
        <div className="flex flex-col gap-3">
          {store.weeklyReviews.map((review) => (
            <Link
              key={review.id}
              href={`/app/coach/revisoes/${review.id}`}
              onClick={() => trackProductEvent("revisao_semanal_aberta")}
              className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
            >
              <p className="text-xs text-muted">{review.dateLabel}</p>
              <p className="text-sm font-bold text-foreground">{review.headline}</p>
              <p className="text-xs font-semibold text-brand">{weeklyDecisionLabel(review.decision)}</p>
            </Link>
          ))}
        </div>
      </div>
    </AthleteAppShell>
  );
}
