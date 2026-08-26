"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_AI_AGENT, isAiAgentId, type AiAgentId } from "@/domain/ai/agents";

export const AI_ADMIN_KEY = "tervelo-ai-admin";

export type AiAdminState = {
  selectedAgent: AiAgentId;
};

const DEFAULT_STATE: AiAdminState = { selectedAgent: DEFAULT_AI_AGENT };
const listeners = new Set<() => void>();
let cached: AiAdminState = DEFAULT_STATE;
let hydrated = false;

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: AiAdminState) {
  cached = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AI_ADMIN_KEY, JSON.stringify(next));
  }
  emit();
}

function readStored(): AiAdminState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(AI_ADMIN_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AiAdminState>;
    if (typeof parsed.selectedAgent === "string" && isAiAgentId(parsed.selectedAgent)) {
      return { selectedAgent: parsed.selectedAgent };
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

export function getAiAdmin(): AiAdminState {
  hydrate();
  return cached;
}

export function getServerAiAdmin(): AiAdminState {
  return DEFAULT_STATE;
}

export function subscribeAiAdmin(listener: () => void): () => void {
  hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function selectAiAgent(id: AiAgentId): AiAdminState {
  hydrate();
  persist({ selectedAgent: id });
  return cached;
}

export function useAiAdmin(): AiAdminState {
  return useSyncExternalStore(subscribeAiAdmin, getAiAdmin, getServerAiAdmin);
}
