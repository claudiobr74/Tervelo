"use client";

import { useState } from "react";

export function CatalogGif({
  src,
  name,
  size = 342,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <p className="rounded-[var(--radius-md)] border border-border bg-background p-4 text-sm text-muted">
        O GIF não está neste servidor. O preview da Vercel não guarda os 2,5 GB. Para ver o
        movimento, rode o app no seu computador com a pasta de GIFs ou envie os arquivos ao bucket
        Nhost <span className="font-bold text-foreground">exercise-media</span>.
      </p>
    );
  }
  return (
    <span className="relative block aspect-square w-full overflow-clip rounded-[var(--radius-md)] bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Demonstração em movimento: ${name}`}
        width={size}
        height={size}
        className="size-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
