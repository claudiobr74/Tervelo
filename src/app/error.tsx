"use client";

import { useEffect } from "react";
import { logError } from "@/lib/logger";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("ui.error_boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-xl font-semibold">Algo deu errado</h1>
      <p className="text-sm text-muted">Tente novamente. Se o problema continuar, recarregue a página.</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-11 w-fit items-center rounded-[var(--radius-md)] bg-brand px-6 text-sm font-semibold text-on-brand"
      >
        Tentar novamente
      </button>
    </main>
  );
}
