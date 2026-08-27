export const PREVIEW_DASHBOARD = {
  kpis: [
    { label: "Usuários Ativos", value: "1.247", delta: "+4.2%", tone: "up" as const },
    { label: "Novos esta Semana", value: "34", delta: "+12.5%", tone: "up" as const },
    { label: "Aderência Média", value: "87%", delta: "-1.2%", tone: "down" as const },
    { label: "Treinos Realizados Hoje", value: "892", delta: "+8.1%", tone: "up" as const },
  ],
  months: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
  aiCosts: [
    { agent: "Recuperação", usd: 342 },
    { agent: "Nutrição", usd: 412 },
    { agent: "Treinamento", usd: 289 },
    { agent: "Segurança", usd: 98 },
  ],
  alerts: [
    {
      tone: "critical" as const,
      title: "Aderência Crítica",
      body: "3 usuários com aderência abaixo de 50%",
    },
    {
      tone: "infra" as const,
      title: "Alerta de Infraestrutura",
      body: "Custo de IA +12% vs. semana anterior",
    },
  ],
  systemAlerts: [
    {
      event: "Falha IA",
      tone: "error" as const,
      description: "Limite de tokens atingido por requisição de nutrição.",
      when: "Há 5m",
    },
    {
      event: "Mudança Plano",
      tone: "brand" as const,
      description: "Matheus Sales fez upgrade para assinatura Elite.",
      when: "Há 14m",
    },
    {
      event: "Novo Cadastro",
      tone: "success" as const,
      description: 'Novo usuário "Ronaldo Silva" cadastrado.',
      when: "Há 32m",
    },
  ],
};

export const PREVIEW_AUDIT_LOGS = [
  {
    id: "lucas-volume",
    name: "Lucas Mendes",
    avatar: "/catalog/admin-users/lucas.webp",
    when: "Hoje, 09:41  •  Contrato IA: v3.2",
    decision: "Redução de Volume",
    decisionTone: "brand" as const,
    outcome: "Aceito pelo Usuário",
    outcomeTone: "success" as const,
    proposed: "Redução de 15% do volume planejado para o treino de Peito e Tríceps.",
    rule: "Protocolo de recuperação v3.2",
    evidence:
      "Frequência cardíaca em repouso aumentou 8% consecutivamente. Variabilidade da Frequência Cardíaca despencou de 68ms para 44ms. Relato de sono ruim por 3 noites consecutivas indica fadiga acumulada de nível moderado-grave. Redução preventiva de lesões ativada.",
  },
  {
    id: "amanda-carga",
    name: "Amanda Santos",
    avatar: "/catalog/admin-users/amanda.webp",
    when: "Hoje, 08:30  •  Contrato IA: v3.2",
    decision: "Aumento de Carga (+2kg)",
    decisionTone: "success" as const,
    outcome: "Aplicado Automático",
    outcomeTone: "success" as const,
    proposed: "Aumento de 2 kg no Supino Reto, com 2 repetições em reserva.",
    rule: "Protocolo de progressão v3.2",
    evidence:
      "Séries fechadas com margem de execução. Sem dado nutricional inventado neste recorte.",
  },
  {
    id: "matheus-sub",
    name: "Matheus Sales",
    avatar: "/catalog/admin-users/matheus.webp",
    when: "Ontem, 19:15  •  Contrato IA: v3.1",
    decision: "Substituição de Exercício",
    decisionTone: "brand" as const,
    outcome: "Recusado pelo Usuário",
    outcomeTone: "muted" as const,
    proposed: "Troca pontual do exercício prescrito. O programa permanece intacto.",
    rule: "Substituição não muta o programa",
    evidence: "Pedido de substituição sem restrição, dor ou equipamento indisponível registrado.",
  },
] as const;
