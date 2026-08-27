"use client";

import { useCallback, useId, useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { useModalFocus } from "@/components/ui/use-modal-focus";

export const MEASUREMENT_POINTS_SRC = "/catalog/pontos-de-medida.webp";
export const MEASUREMENT_POINTS_ALT =
  "Guia TERVELO dos pontos de medida: ombro, peito, braço contraído, abdômen na altura do umbigo, cintura, quadril, coxa e panturrilha.";

export function MeasurementPointsGuide() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);
  const dialogRef = useModalFocus<HTMLDivElement>(open, close);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[280px] w-[140px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface p-1.5 text-muted"
        aria-label="Abrir guia de pontos de medição"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MEASUREMENT_POINTS_SRC}
          alt=""
          width={140}
          height={210}
          className="h-[210px] w-full object-contain"
        />
        <p className="mt-auto px-1 pb-1 text-center text-[11px] leading-tight text-muted">Pontos de medição</p>
      </button>
      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          <div className="mx-auto flex h-full w-full max-w-[390px] flex-col">
            <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-4">
              <h2 id={titleId} className="text-lg font-extrabold text-foreground">
                Pontos de medição
              </h2>
              <button type="button" onClick={close} aria-label="Fechar" className="text-foreground">
                <FigmaIcon src="/icons/close.svg" alt="" size={24} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MEASUREMENT_POINTS_SRC}
                alt={MEASUREMENT_POINTS_ALT}
                width={1024}
                height={1536}
                className="mx-auto h-auto w-full rounded-[var(--radius-lg)]"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
