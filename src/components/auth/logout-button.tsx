"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SYNC_COPY } from "@/domain/offline";
import { requestSync } from "@/lib/offline/engine-runner";
import { pendingSyncCount } from "@/lib/offline/queue-store";

const DEFAULT_BUTTON_CLASS =
  "inline-flex h-11 w-fit items-center justify-center rounded-[var(--radius-md)] border border-border px-6 text-sm font-semibold text-foreground";

const BLOCK_BUTTON_CLASS =
  "flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-bold text-error";

const SIDEBAR_BUTTON_CLASS =
  "flex h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-border text-sm font-semibold text-foreground";

export function LogoutButton({
  variant = "default",
}: {
  variant?: "default" | "block" | "sidebar";
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function logout({ abandon }: { abandon: boolean }) {
    if (!abandon && pendingSyncCount() > 0) {
      setConfirming(true);
      return;
    }
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border p-4">
        <p className="text-sm text-foreground">{SYNC_COPY.logoutPendingTitle}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-border px-4 text-sm font-semibold text-foreground"
          >
            {SYNC_COPY.logoutCancel}
          </button>
          <button
            type="button"
            onClick={() => {
              void requestSync({ force: true });
              setConfirming(false);
            }}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-brand px-4 text-sm font-semibold text-brand"
          >
            {SYNC_COPY.logoutTrySync}
          </button>
          <button
            type="button"
            onClick={() => void logout({ abandon: true })}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-brand px-4 text-sm font-semibold text-on-brand"
          >
            {SYNC_COPY.logoutAnyway}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void logout({ abandon: false })}
      className={
        variant === "block"
          ? BLOCK_BUTTON_CLASS
          : variant === "sidebar"
            ? SIDEBAR_BUTTON_CLASS
            : DEFAULT_BUTTON_CLASS
      }
    >
      Sair da conta
    </button>
  );
}
