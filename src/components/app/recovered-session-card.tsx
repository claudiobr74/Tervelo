"use client";

import { useRouter } from "next/navigation";
import { recoveredSessionCopy, SYNC_COPY } from "@/domain/offline";
import { endActiveSession, startWorkout, type LiveSessionState } from "@/lib/training/live-session";

export function RecoveredSessionCard({ live }: { live: LiveSessionState }) {
  const router = useRouter();
  if (live.status !== "active" && live.status !== "resting") return null;
  if (!live.startedAt) return null;

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <p className="text-xs font-bold uppercase text-brand">{SYNC_COPY.recoveredTitle}</p>
      <p className="text-sm text-foreground">{recoveredSessionCopy(live.startedAt)}</p>
      <button
        type="button"
        onClick={() => {
          startWorkout();
          router.push(live.status === "resting" ? "/app/workout/rest" : "/app/workout/exercise");
        }}
        className="flex h-12 w-full items-center justify-center rounded-[var(--radius-lg)] bg-brand text-[15px] font-bold text-on-brand"
      >
        {SYNC_COPY.continueWorkout}
      </button>
      <button
        type="button"
        onClick={() => {
          endActiveSession();
          router.push("/app/workout/summary");
        }}
        className="flex h-12 w-full items-center justify-center rounded-[var(--radius-lg)] border border-border text-sm font-bold text-foreground"
      >
        {SYNC_COPY.endSession}
      </button>
    </section>
  );
}
