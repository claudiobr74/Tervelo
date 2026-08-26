# TERVELO — Auditoria de frequência cardíaca

Inspeção feita **antes** da implementação (Phase 11). Sem P0 blocker: o recurso segue neste branch.

## Veredito

**PROSSEGUIR.** Não há frequência cardíaca, Web Bluetooth nem `HEART_RATE_CONTEXT` no código. O motor de treino, o RestTimer, o Nhost e o Coach permanecem; a FC entra como camada complementar opcional.

## Superfícies inspecionadas

| Área | Situação | Encaixe |
| --- | --- | --- |
| Settings / Configurações do atleta | Sem rota. Figma `perfil` `2:1334` / Light `15:4876` é o hub “Mais”; **não** há “Treino e dispositivos” | Bloco novo no Design System; consolidar com Figma depois (`FIGMA_PENDING`) |
| Workout Mode | `exercise-execution-screen`, status `idle/active/resting/completed` | Indicador discreto se `heart_rate_enabled` |
| RestTimer | `domain/timer/rest-timer.ts` + `live-session` | Sem segundo timer; janela de recuperação interna no `SET_COMPLETED` |
| Eventos de série | Não existem `SESSION_*` nomeados; há `startedAt`, `performedAt`, timer | Acrescentar linha do tempo **aditiva** em `live-session` |
| Offline | `offline-queue.ts` idempotente para `set_results`; flush ainda sem rede | Buffer irmão para samples; BLE independe de internet |
| Schema Nhost | Sem wearable/HR | `wearable_devices`, `heart_rate_sessions`, `heart_rate_samples` |
| Preferências | `athlete_preferences` KV + `localStorage` (tema) | `heart_rate_enabled` default `false` |
| Hasura | `athleteOwn` + `set.user_id` | Mesmo padrão; samples append-only |
| Intelligence Engine | `NUTRITION_CONTEXT`; orchestrate **501** | `HEART_RATE_CONTEXT` só com resumo; sem raw samples no LLM |
| Coach integrado | `coach-preview.ts` | Sinal complementar; sem Coach Cardíaco separado |
| QA Auditor | Checks 13–20 (nutrição) | Checks 21–30 (frequência cardíaca) |
| Figma | Execução `2:372`, descanso `10:758`, resumo `2:428`; perfil sem bloco FC | Overlay discreto; sem tela de monitor |

## Fora de escopo (spec §57)

Variabilidade da FC, ECG, arritmia, diagnóstico, saturação, pressão, Health Connect, Apple Health, zonas para musculação, calorias “precisas”, score cardíaco.

## P0 blockers

Nenhum. Itens abaixo são o trabalho desta fase, não impedimentos.

- Sem persistência HR → criar tabelas.
- Sem `navigator.bluetooth` no domínio → provider na borda.
- Function de IA continua 501 → contexto determinístico mesmo assim.
- Chromium de CI sem BLE → testes unitários do parser + e2e de toggle/unsupported; hardware real no checklist.
