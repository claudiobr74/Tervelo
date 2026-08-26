"use client";

import { useSyncExternalStore } from "react";

export type CoachProposalStatus = "pending" | "accepted" | "kept";

const KEY = "tervelo.preview.coachProposal.v1";

type Snapshot = { status: CoachProposalStatus };

const DEFAULT_STATE: Snapshot = { status: "pending" };
const listeners = new Set<() => void>();
let cached: Snapshot = DEFAULT_STATE;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: Snapshot) {
  cached = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  emit();
}

function readStored(): Snapshot {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Snapshot;
    if (parsed.status === "accepted" || parsed.status === "kept" || parsed.status === "pending") {
      return { status: parsed.status };
    }
    return DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  cached = readStored();
}

export function getCoachProposalSnapshot(): Snapshot {
  hydrate();
  return cached;
}

export function getServerCoachProposalSnapshot(): Snapshot {
  return DEFAULT_STATE;
}

export function subscribeCoachProposal(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setCoachProposalStatus(status: CoachProposalStatus) {
  hydrate();
  persist({ status });
}

export function useCoachProposal(): Snapshot {
  return useSyncExternalStore(
    subscribeCoachProposal,
    getCoachProposalSnapshot,
    getServerCoachProposalSnapshot,
  );
}
