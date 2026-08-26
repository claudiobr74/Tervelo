# TERVELO — Plano de implementação

Dependências: `PRE_IMPLEMENTATION_AUDIT.md`, `DATABASE_DESIGN.md`, `NHOST_ARCHITECTURE.md`, `FIGMA_IMPLEMENTATION.md`, `DECISIONS_REQUIRED.md`.

Veredito atual: **READY_WITH_FIXES**. Phases 0–12 neste repositório (Phase 12 neste branch).

---

## 1. Princípios

1. Segurança e autorização no backend (Hasura + Functions). Frontend nunca é a barreira.
2. Figma prevalece para UI. Sem node na tabela = sem UI definitiva (`FIGMA_PENDING`).
3. Domínio desacoplado de React e de strings GraphQL.
4. Histórico longitudinal nunca é sobrescrito.
5. IA não inventa dados ausentes; memória vem do banco.
6. Sem Supabase, Firebase ou secrets no cliente.
7. Vercel só na Phase 14.

---

## TERVELO — MÓDULO ALUNO

Prompt das fases de produto do atleta (não admin). Fonte: [`docs/MODULO_ALUNO.md`](MODULO_ALUNO.md).

Cobre login, cadastro, onboarding e `/app/*` (Phases 4–9, 11 e 12, mais busca/anilhas do aluno na Phase 5). Phase 10 é o módulo admin.

**Próximas fases:** evidência só com **imagens das telas** (Light/Dark, 390px). **Vídeo não é necessário.**

---

## TERVELO — PROMPT MESTRE DE IMPLEMENTAÇÃO DA INTELIGÊNCIA ARTIFICIAL

Prompt do módulo de IA. Fonte: [`docs/IA_PROMPT_MESTRE.md`](IA_PROMPT_MESTRE.md).

Cobre o contrato em `/admin/ai` (escolha de agente no modo administrar) e o pipeline. O coach do atleta está no MÓDULO ALUNO (`/app/coach`). Evidência: **apenas imagens** Light/Dark; admin é desktop-first. Sem vídeo.

---

## 2. Ordem das fases

| Fase | Nome | UI Figma | Pode começar |
| --- | --- | --- | --- |
| 0 | Auditoria | inventário completo | concluída neste PR |
| 1 | Foundation | tokens `28:527` + primitivos `2:2` | concluída neste PR |
| 2 | Nhost | não | concluída neste branch |
| 3 | Domain | não | concluída neste branch |
| 4 | Auth + Onboarding | nodes `2:1428`–`2:1765` (mobile); desktop **parcial** | concluída neste branch |
| 5 | Exercise & Equipment | busca `10:1016`, anilhas `10:835`, admin `10:7`/`10:201`/`10:377` | concluída neste branch |
| 6 | Training Engine | execução `2:372`, timer `10:758`, supersérie, drop-set, etc. | concluída neste branch |
| 7 | Recovery + Body + Progress — **MÓDULO ALUNO** | `2:499`, `2:1122`, `2:1025` | concluída neste branch |
| 8 | Nutrition — **MÓDULO ALUNO** | `2:817` / `15:1436` | concluída neste branch |
| 9 | AI — **MÓDULO ALUNO** (coach) + contrato admin | coach `2:944`, alteração `10:2651`, admin IA `2:2954` | concluída neste branch |
| 10 | Admin | 7 screens Dark + Light | concluída neste branch; Treinamento/Nutrição/Settings **FIGMA_PENDING** |
| 11 | Frequência cardíaca (Web Bluetooth real) | bloco Settings `FIGMA_PENDING`; overlay no treino | concluída neste branch |
| 12 | Estado do Atleta + check-ins + revisão semanal | UI mínima Design System; **FIGMA_UI_PENDING** | concluída neste branch |
| 13 | Hardening | conforme telas existentes | após fluxos reais |
| 14 | Vercel | app navegável | só com critérios da spec |

---

## 3. Phase 1 — Foundation

**Objetivo:** app Next.js compilando, temas, Nhost SDK stub, testes, CI.

### Entregas

- `create-next-app` estável atual, App Router, TypeScript `strict`
- ESLint, Prettier, Vitest, Playwright (configuração; e2e de produto depois)
- GitHub Actions: `lint`, `typecheck`, `test`, `build`
- `.gitignore`, `.env.example`, `README.md`
- CSS variables Light/Dark (Handoff `28:527`) + `prefers-color-scheme` + persistência (sem Zustand no domínio, D-015)
- Fonte Manrope (next/font)
- `src/lib/nhost` (client + server cookie storage) **sem secrets**
- Error boundary / logging estruturado mínimo
- `.cursor/rules/` conforme spec §59
- Pasta `src/graphql/` vazia com convenção por domínio
- `docs/ARCHITECTURE.md`, `SECURITY.md`, `TESTING.md` (esqueleto preciso)

### Rotas nesta fase

Somente placeholder **não visual de produto**: health interna se útil. **Não** criar `/app/today` com dashboard genérico.

### Fora de escopo

Telas de login, landing marketing inventada, componentes com look Radix default.

### Critério de saída

`npm run build`, lint e typecheck passam; tema claro/escuro/sistema funciona em uma página de tokens (página de desenvolvimento, não produto).

---

## 4. Phase 2 — Nhost

Ver `NHOST_ARCHITECTURE.md`.

- `nhost init` (ou `--remote` se o operador ligar o projeto)
- `nhost.toml`: locales `pt`, roles `user` / `admin` / `super_admin`
- Migrations do schema Phase 2 (núcleo: profiles, athlete, gyms, catalog seed mínimo)
- Metadata Hasura + permissions
- Storage buckets
- Trigger `auth.users` → `profiles`
- Seeds controlados (músculos, categorias de equipamento — não milhares de exercícios ainda)

**Acesso:** atleta = JWT `user`; administrador = `admin` (e `super_admin` para auditoria/contratos). Promoção só via `auth.user_roles` no SQL.

Permissions testadas (matriz Vitest). `nhost up` exige Docker no operador.

---

## 5. Phase 3 — Domain

Camadas em `src/` (nomes ajustáveis, responsabilidades não):

```text
src/domain/          # regras puras, zero I/O
src/application/     # casos de uso + Zod
src/server/repositories/
```

Módulos (primeira fatia nesta fase):

| Módulo | Primeira fatia |
| --- | --- |
| athlete | idade derivada de `birth_date` |
| measurement | append-only + `supersedes_id` |
| gym | halteres lista ou min/max/incremento |
| equipment | canônico vs modelo vs inventário |
| exercise | aliases de busca, um canônico |
| training | hierarquia; substituição não muta o programa |
| timer | `expected_end_at - now`; pausa; −15/+15/+30 |
| recovery | tendência só com janela (≥3 pontos) |
| nutrition | nomes por extenso; dia aberto |
| ai | não fabricar dados; publish só `super_admin` |
| plates | carga → discos simétricos, menor quantidade, estoque |

GraphQL: documents em `src/graphql/<domínio>/`. Codegen contra schema local fica para quando `nhost up` existir (Docker no operador). Tipos de domínio não dependem do codegen.

---

## 6. Phase 4 — Auth + Onboarding

Backend: signup, login, logout, reset password (pelo e-mail do login), session cookie, `src/proxy.ts` nas rotas `/onboarding`, `/app`, `/admin`.

UI: `/login` `2:1428`, `/signup` `2:1478`, onboarding `2:1526`–`2:1765`. Sem status bar iOS (D-016). Google/Apple visíveis e **desabilitados** (D-017). `/forgot-password` permanece **FIGMA_PENDING**.

Com `NEXT_PUBLIC_NHOST_SUBDOMAIN=local` (sem Docker), o formulário válido abre sessão de pré-visualização para exercitar o fluxo.

---

## 7. Phase 5 — Exercise & Equipment

- Catálogo escalável (aliases, não duplicar fabricantes)
- Inventário por academia: máquinas, barras (peso real), anilhas (não enum), halteres (lista ou min/max/increment)
- Algoritmo de anilhas: carga desejada → discos por lado, simetria, menor quantidade, inventário real
- Testes unitários cobrindo 0.5–25 kg, barra 20 kg, impossível, ímpar, estoque insuficiente

UI de biblioteca: busca `10:1016` / Light `15:5213`; admin `10:7` / `10:201` / `10:377`. Catálogo de equipamentos **do atleta** e academias do atleta: `FIGMA_PENDING`.

---

## 8. Phase 6 — Training Engine

Modelo:

```text
Objetivo → Programa → Bloco → Semana → Sessão → Exercício → Série → Resultado → Adaptação
```

- Métodos como dados (warmup, working, back-off, super/tri/giant, circuit, drop, rest-pause, cluster, myo-reps, pause, tempo, isometria)
- Substituição pontual **não** muta o programa silenciosamente
- Timer persistido; restante = `expected_end_at - now`
- Offline: fila local idempotente para `set_results`

Rotas mobile (Dark = layout; Light = tokens): `/app/today` `2:15`, `/app/workout` `2:188`, `/app/workout/exercise` `2:372` (aquecimento `10:2757`, supersérie `10:2584`, drop-set `15:1109`), `/app/workout/rest` `10:758`, `/app/workout/summary` `2:428`. Nav atleta: Hoje / Treino / Evolução / Coach / Mais. FAB `15:1055` sem destino — omitido. Desktop de sessão `15:570` sem execução detalhada.

---

## 9. Phase 7 — Recovery + Body + Progress

**TERVELO — MÓDULO ALUNO.** Append-only. IA usa tendências, não ponto único. Nomes por extenso na UI.

Rotas mobile (Dark = layout; Light = tokens): `/app/recovery` `2:499`, `/app/progress` `2:1025`, `/app/body` `2:1122`. Desktop `15:216` / `15:1706` fica para endurecer o layout largo; prioridade 390px.

Nav **Evolução** liga em `/app/progress`. Coach `/app/coach` é Phase 9. Nutrição `/app/nutrition` é Phase 8.

---

## 10. Phase 8 — Nutrição

**TERVELO — MÓDULO ALUNO.** Node mobile `2:817` / Light `15:4343`. Desktop `15:1436` fica para endurecer o layout largo; prioridade 390px. Evidência: screenshots das telas; sem vídeo.

`/app/nutrition`: objetivo, targets diários (energia, proteínas, carboidratos, gorduras, hidratação), distribuição das refeições, insight do nutricionista virtual. Check-in só no dia aberto (`nutrition_checkins`). Nav **Mais** liga nesta tela. Coach `/app/coach` é Phase 9. Calendário do atleta: `FIGMA_PENDING`.

---

## 11. Phase 9 — AI

**TERVELO — MÓDULO ALUNO** no coach do atleta (`2:944` / Light `15:4465`) e na alteração pontual (`10:2651` / Light `15:8472`).

**TERVELO — PROMPT MESTRE DE IMPLEMENTAÇÃO DA INTELIGÊNCIA ARTIFICIAL** no contrato admin (`/admin/ai`, `2:2954` / Light `15:6902`) e no pipeline de agentes. Escolha de agente no modo administrar (Figma não tem picker; a UI expõe os 8 agentes por extenso).

**TERVELO — ADDENDUM** (`docs/IA_ADDENDUM.md`): treino e nutrição no mesmo sistema. Não substitui o prompt mestre nem as regras protegidas de segurança. `NUTRITION_CONTEXT` obrigatório quando houver dados nutricionais. QA 13–20.

```text
ai/agents/  ai/skills/  ai/policies/  ai/evaluators/
```

Fluxo: contexto → safety → programa → recovery → desempenho → strength → periodização → nutrição (se necessário) → progress → QA → resposta.

Execução em **Nhost Functions** (chaves de modelo nunca no cliente). Rate limit. Audit (`ai_runs`, `ai_decisions`) sem chain-of-thought.

Admin “Contrato da IA”: `2:2954` / Light `15:6902`. Coach atleta: `2:944`. Alteração pontual: `10:2651`. Versionamento de contrato no banco desde o schema.

Nesta pré-visualização: UI do coach (`/app/coach`, `/app/coach/ajuste`) + contrato admin + escolha de agente. Respostas a partir de fatos conhecidos; dados ausentes = UNKNOWN. Sem orquestração real (Function devolve 501). Desktop do coach `15:418` fica para endurecer o layout largo; prioridade 390px. Evidência: screenshots das telas; sem vídeo.

---

## 12. Phase 10 — Admin

Desktop-first (1440). Screens com node: dashboard `2:2503` / Light `15:6624`, usuários `2:2659` / `15:6757`, IA `2:2954` / `15:6902`, auditoria `2:3112` / `15:7015`, exercícios `10:7` / `15:7136`, equipamentos `10:201` / `15:7244`, inventário `10:377` / `15:7366`.

Sidebar Dark ainda cita Treinamento, Nutrição e Configurações **sem screen** → `FIGMA_PENDING`. Detalhe do atleta sem frame. Proteção server-side (`src/proxy.ts`) + role Hasura. Sem UI genérica. Evidência: screenshots Light/Dark desktop; sem vídeo.

Nesta pré-visualização: as 7 rotas com node. `audit_logs` no banco permanece leitura `super_admin`; a tela de auditoria usa recorte local. Sem atribuir `admin` pelo cliente.

---

## 13. Phase 11 — Frequência cardíaca

Recurso **opcional**. Default `heart_rate_enabled = false`. Sem Mock Provider. Provider real: `WebBluetoothHeartRateProvider` (Heart Rate Service / Heart Rate Measurement). Parser determinístico, estados além de connected/disconnected, buffer local + flush em lote, persistência Nhost (`wearable_devices`, `heart_rate_sessions`, `heart_rate_samples`), `HEART_RATE_CONTEXT` só quando habilitado e com dados suficientes.

Settings: `/app/settings` (Treino e dispositivos). Figma não tem o bloco → Design System + `FIGMA_PENDING`. Workout: indicador discreto. Sem zonas para musculação. Sem VFC/ECG/diagnóstico.

Evidência: screenshots Light/Dark 390px. Hardware real: [`HEART_RATE_HARDWARE_VALIDATION.md`](HEART_RATE_HARDWARE_VALIDATION.md). Auditoria: [`HEART_RATE_IMPLEMENTATION_AUDIT.md`](HEART_RATE_IMPLEMENTATION_AUDIT.md).

---

## 14. Phase 12 — Estado do Atleta, check-ins e revisão semanal

Sistema integrado (não substitui o Coach Integrado nem o check-in de recuperação longitudinal da Phase 7):

- Motor de Tendências e Motor de Qualidade dos Dados (código determinístico)
- Motor de Estado do Atleta (`athlete-state-v1`) — sem nota 0–100
- Check-in Pré-Treino (opcional, 15–30s, CTA **Começar treino**)
- Check-out Pós-Treino (opcional)
- Resposta da Sessão e Orçamento de Mudanças
- Revisão Semanal do Coach (ponto preferencial de mudança)
- Persistência Nhost: `pre_workout_checkins`, `post_workout_checkouts`, `athlete_state_snapshots`, `weekly_coach_reviews`, `weekly_review_decisions`
- Preferências default **ligadas**: `pre_workout_checkin_enabled`, `weekly_coach_review_enabled`

UI mínima no Design System. Sem frames Figma → **FIGMA_UI_PENDING**. Nomes na interface sempre em PT-BR.

Auditoria: [`ATHLETE_STATE_TRIO_PRE_IMPLEMENTATION_AUDIT.md`](ATHLETE_STATE_TRIO_PRE_IMPLEMENTATION_AUDIT.md).

---

## 15. Phase 13 — Hardening

Security review, testes de permission, a11y AA, offline do treino, observabilidade, performance.

---

## 16. Phase 14 — Vercel

Somente quando:

- `build` / lint / typecheck / testes críticos passam
- Auth e Nhost funcionam
- Fluxo navegável (mesmo que Figma cubra só parte das telas)
- Secrets fora do git

Preview em PRs; Production em `main` após aprovação humana.

---

## 17. Git

Especificação: `main`, `develop`, `feature/*`, `fix/*`.

Este PR: `cursor/phase-0-pre-implementation-audit-c3ef` → `main` (ambiente Cloud Agent).

Após Phase 1:

1. Criar `develop` a partir de `main`.
2. Features seguintes → `develop`.
3. Commits pequenos. Proibido “implement entire app”.

---

## 18. Testes por fase

| Fase | Foco |
| --- | --- |
| 1 | config, tokens, theme |
| 2 | permissions GraphQL, trigger profile |
| 3 | plate calc, timer math, validações Zod |
| 4 | auth flows (integration) |
| 5 | inventário + anilhas |
| 6 | persistência de série + idempotência |
| 7 | check-in de recuperação, composição append-only, e2e longitudinal |
| 8 | check-in de nutrição no dia aberto, progresso de targets, e2e `/app/nutrition` |
| 9 | contrato IA + escolha de agente no admin + recusa de fabricar dados |
| 10 | dashboard / usuários / auditoria desktop, redirect sem papel admin |
| 11 | e2e Playwright da spec §56 quando houver UI |
| 12 | Motor de Estado, check-in/check-out, revisão semanal, QA 31–44 |

---

## 19. Definition of Done (feature)

Só “pronta” com: lógica, persistência, autorização, validação, testes, loading, error, empty, a11y, responsivo, Light, Dark, fidelidade Figma **quando o design existir**.

Se Figma não existir para aquela rota: DoD de backend (lógica + persistência + authz + testes) com flag `FIGMA_PENDING` na feature. Rotas com node na tabela **não** usam placeholder genérico.
