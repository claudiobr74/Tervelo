# Auditoria — Estado do Atleta, Check-ins e Revisão Semanal

**Veredito:** `READY_WITH_FIXES`  
**Data:** 2026-08-26  
**Branch:** `cursor/phase-12-athlete-state-c3ef`  
**Não substitui:** Prompt Mestre, Motor de Inteligência, Coach Integrado, Coach de Nutrição, Arquiteto de Treinamento, Coach do Treino, Analista de Progresso, Analista de Composição Corporal, Recuperação e Segurança, contexto de FC, Nhost, Hasura, Modo Treino, programa longitudinal.

---

## 1. Superfícies inspecionadas

| Superfície                     | Situação atual                                                                                           | Ação                                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Modo Treino / sessão ativa     | `live-session.ts`, `workout-session-screen`, `exercise-execution-screen` (auto-`startWorkout` se `idle`) | Gate do Check-in Pré-Treino **antes** de `startWorkout` em Hoje e na sessão; auto-start no exercício não bloqueia (check-in é opcional) |
| Ciclo da sessão                | idle → active → resting → completed → `/app/workout/summary`                                             | Check-out no resumo; sessão permanece válida se pulado                                                                                  |
| Timer de Intervalo             | `rest-timer.ts` + tela `/app/workout/rest`                                                               | Sem mudança estrutural                                                                                                                  |
| Contexto Nutricional           | `nutrition-context.ts`, QA 13–20                                                                         | Motor de Estado consome quando houver dados; não recalcular metas                                                                       |
| Corpo e Medidas                | `body_measurements` append-only, `/app/body`                                                             | Tendência/média móvel; peso isolado nunca muda o plano                                                                                  |
| Frequência cardíaca            | default off; `HEART_RATE_CONTEXT` condicional                                                            | Só entra se habilitada **e** com dados; complementar                                                                                    |
| Perfil do Atleta               | `athlete_profiles` + preferências KV                                                                     | Dois toggles novos em `athlete_preferences`                                                                                             |
| Analista de Progresso          | `progress/change.ts` (percentual)                                                                        | Motor de Tendências assume séries temporais                                                                                             |
| Coach Integrado                | `/app/coach`, `coach-preview.ts`                                                                         | Novas intenções; revisão semanal como ponto preferencial de mudança                                                                     |
| Auditor de Qualidade           | QA 13–20 + QA 21–30 (FC)                                                                                 | QA 31–44 do trio                                                                                                                        |
| Nhost / Hasura                 | `recovery_checkins` existe (longitudinal diário)                                                         | **Não duplicar.** Novas tabelas de sessão (inglês físico)                                                                               |
| Offline                        | `offline-queue.ts` de `set_results`                                                                      | Fila idempotente de check-in/check-out (`client_mutation_id`)                                                                           |
| Figma `uJxhUZVuIzCpFL94dtQj0G` | Check-in existente = Recuperação `2:499` / Light `15:4144`                                               | Sem frames para pré-treino, check-out, estado do atleta, revisão semanal → **`FIGMA_UI_PENDING`**                                       |

---

## 2. Riscos e correções (não bloqueiam domínio)

| ID   | Gravidade | Item                                                                                 | Correção nesta fase                                                        |
| ---- | --------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| F-01 | P1        | Check-in de recuperação Phase 7 é **diário longitudinal**, sem `training_session_id` | Manter separado. Pré-treino é agudo da sessão                              |
| F-02 | P1        | `exercise-execution-screen` chama `startWorkout()` se `idle`                         | Não bloquear treino; check-in ausente = UNKNOWN + reduzir confiança        |
| F-03 | P1        | Sem nodes Figma para o trio                                                          | UI mínima no Design System; nomes PT-BR; `FIGMA_UI_PENDING`                |
| F-04 | P2        | Coach desktop cita “Prontidão para Treino”                                           | **Não** criar score 0–100; linguagem natural                               |
| F-05 | P2        | Flush de `set_results` ainda é local                                                 | Mesmo padrão para check-ins; idempotência por `client_mutation_id`         |
| F-06 | P2        | Function de orquestração continua 501                                                | Processamento determinístico suficiente para estado, tendência e qualidade |
| F-07 | P3        | Hardening/Vercel                                                                     | Permanecem fases seguintes (13 e 14)                                       |

**Nenhum P0.** Seguir implementação.

---

## 3. Entidades (nomes físicos em inglês)

Não misturar copy de produto com convenção de banco.

| Conceito (PT-BR)         | Tabela                                         |
| ------------------------ | ---------------------------------------------- |
| Check-in Pré-Treino      | `pre_workout_checkins`                         |
| Check-out Pós-Treino     | `post_workout_checkouts`                       |
| Estado do Atleta         | `athlete_state_snapshots` (`athlete-state-v1`) |
| Revisão Semanal do Coach | `weekly_coach_reviews`                         |
| Decisões da revisão      | `weekly_review_decisions`                      |

Hasura: `athleteOwn`, insert+select. Check-ins e snapshots **sem update** (append-only). Decisões: update só de acompanhamento.

Preferências (default **ligado**):

- `pre_workout_checkin_enabled`
- `weekly_coach_review_enabled`

---

## 4. Nomenclatura na interface

Sempre português do Brasil. Sem nomes de classe, enum ou engenharia.

| Interno                             | Interface                      |
| ----------------------------------- | ------------------------------ |
| Athlete State                       | Estado do Atleta               |
| Pre-Workout Check-in                | Check-in Pré-Treino            |
| Post-Workout Check-in               | Check-out Pós-Treino           |
| Weekly Coach Review                 | Revisão Semanal do Coach       |
| `CONSTRUINDO_REFERENCIA_INDIVIDUAL` | Aprendendo seu padrão          |
| `RECUPERACAO_REDUZIDA`              | Recuperação abaixo do habitual |
| `SEM_MUDANCA`                       | Plano mantido                  |

---

## 5. Princípios que o código deve travar

1. Sem nota arbitrária de prontidão 0–100.
2. Sempre observação / interpretação / recomendação.
3. Check-in e check-out opcionais; não bloqueiam o treino.
4. Check-in ausente ≠ recuperação normal.
5. Uma noite ruim isolada → **manter**.
6. Ajuste de tempo → só a sessão atual (`AJUSTE_DA_SESSAO`).
7. Mudança estrutural só com evidência longitudinal ou evento relevante.
8. Revisão Semanal é o ponto preferencial de mudança.
9. Performance objetiva antes da percepção.
10. FC só se habilitada; complementar.
11. Nutrição faz parte do estado quando houver dados.
12. Orçamento de Mudanças: a menor alteração necessária.
13. Associação, nunca causalidade indevida.

---

## 6. Ordem desta fase

1. Contratos e schemas
2. Motor de Tendências
3. Motor de Qualidade dos Dados
4. Motor de Estado do Atleta
5. Check-in Pré-Treino
6. Integração com Coach do Treino
7. Check-out Pós-Treino
8. Resposta da Sessão
9. Atualização do Estado do Atleta
10. Revisão Semanal do Coach
11. Coach Integrado
12. Persistência Nhost
13. Interface mínima
14. Auditoria da IA
15. Testes
16. Observabilidade (eventos técnicos, sem conteúdo fisiológico)
