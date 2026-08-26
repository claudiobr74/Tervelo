"use client";

export type CoachProposalStatus = "pending" | "accepted" | "kept";

const KEY = "tervelo.preview.coachProposal.v1";

type Snapshot = { status: CoachProposalStatus };

const listeners = new Set<() => void>();

function empty(): Snapshot {
  return { status: "pending" };
}

function read(): Snapshot {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Snapshot;
    if (parsed.status === "accepted" || parsed.status === "kept" || parsed.status === "pending") {
      return parsed;
    }
    return empty();
  } catch {
    return empty();
  }
}

function write(next: Snapshot) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}

export function getCoachProposalSnapshot(): Snapshot {
  return read();
}

export function subscribeCoachProposal(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCoachProposalStatus(status: CoachProposalStatus) {
  write({ status });
}
