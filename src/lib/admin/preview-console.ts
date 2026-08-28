export const PREVIEW_DASHBOARD = {
  kpis: [
    { label: "Usuários Ativos", value: "0", delta: "", tone: "up" as const },
    { label: "Novos esta Semana", value: "0", delta: "", tone: "up" as const },
    { label: "Aderência Média", value: "—", delta: "", tone: "down" as const },
    { label: "Treinos Realizados Hoje", value: "0", delta: "", tone: "up" as const },
  ],
  months: [] as string[],
  aiCosts: [] as { agent: string; usd: number }[],
  alerts: [] as { tone: "critical" | "infra"; title: string; body: string }[],
  systemAlerts: [] as {
    event: string;
    tone: "error" | "brand" | "success";
    description: string;
    when: string;
  }[],
};

export const PREVIEW_AUDIT_LOGS: {
  id: string;
  name: string;
  avatar: string;
  when: string;
  decision: string;
  decisionTone: "brand" | "success";
  outcome: string;
  outcomeTone: "success" | "muted";
  proposed: string;
  rule: string;
  evidence: string;
}[] = [];
