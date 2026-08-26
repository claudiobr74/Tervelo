"use client";

import type { HeartRateSample, WorkoutTimelineEvent } from "@/domain/heart-rate/types";

export function HeartRateChart({
  samples,
  events,
}: {
  samples: HeartRateSample[];
  events: WorkoutTimelineEvent[];
}) {
  const valid = samples.filter((sample) => sample.isValid);
  if (valid.length < 2) {
    return <p className="text-xs text-muted">Ainda não há série temporal suficiente para o gráfico.</p>;
  }
  const times = valid.map((sample) => Date.parse(sample.recordedAt));
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const bpms = valid.map((sample) => sample.bpm);
  const minB = Math.min(60, ...bpms);
  const maxB = Math.max(180, ...bpms);
  const width = 342;
  const height = 140;
  const pad = 8;
  const x = (t: number) => pad + ((t - minT) / Math.max(1, maxT - minT)) * (width - pad * 2);
  const y = (bpm: number) => height - pad - ((bpm - minB) / Math.max(1, maxB - minB)) * (height - pad * 2);
  const points = valid.map((sample, index) => `${x(times[index]).toFixed(1)},${y(sample.bpm).toFixed(1)}`).join(" ");

  const rests = restRanges(events, minT, maxT);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[140px] w-full text-brand" role="img" aria-label="Frequência cardíaca ao longo do treino">
      {rests.map((rest, index) => (
        <rect
          key={index}
          x={x(rest.start)}
          y={pad}
          width={Math.max(1, x(rest.end) - x(rest.start))}
          height={height - pad * 2}
          className="fill-surface-interactive/80"
        />
      ))}
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

function restRanges(events: WorkoutTimelineEvent[], minT: number, maxT: number): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  let open: number | null = null;
  for (const event of events) {
    const t = Date.parse(event.at);
    if (event.type === "REST_STARTED") open = t;
    if (event.type === "REST_COMPLETED" && open !== null) {
      ranges.push({ start: Math.max(minT, open), end: Math.min(maxT, t) });
      open = null;
    }
  }
  if (open !== null) ranges.push({ start: Math.max(minT, open), end: maxT });
  return ranges;
}
