# TERVELO — Plano de implementação

Dependências: `PRE_IMPLEMENTATION_AUDIT.md`, `DATABASE_DESIGN.md`, `NHOST_ARCHITECTURE.md`, `FIGMA_IMPLEMENTATION.md`, `DECISIONS_REQUIRED.md`.

Veredito atual: **READY_WITH_FIXES**. Phase 1 pode iniciar após merge desta auditoria.

---

## 1. Princípios

1. Segurança e autorização no backend (Hasura + Functions). Frontend nunca é a barreira.
2. Figma prevalece para UI. Sem node na tabela = sem UI definitiva (`FIGMA_PENDING`).
3. Domínio desacoplado de React e de strings GraphQL.
4. Histórico longitudinal nunca é sobrescrito.
5. IA não inventa dados ausentes; memória vem do banco.
6. Sem Supabase, Firebase ou secrets no cliente.
7. Vercel só na Phase 12.

---

## 2. Ordem das fases

| Fase | Nome | UI Figma | Pode começar |
| --- | --- | --- | --- |
| 0 | Auditoria | inventário completo | concluída neste PR |
| 1 | Foundation | tokens `28:527` + primitivos `2:2` | sim |
| 2 | Nhost | não | sim |
| 3 | Domain | não | sim |
| 4 | Auth + Onboarding | nodes `2:1428`–`2:1765` (mobile); desktop **parcial** | UI mobile sim; `/forgot-password` não |
| 5 | Exercise & Equipment | busca `10:1016`, anilhas `10:835`, admin `10:7`/`10:201`/`10:377` | sim |
| 6 | Training Engine | execução `2:372`, timer `10:758`, supersérie, drop-set, etc. | UI sim nos nodes |
| 7 | Recovery + Body + Progress | `2:499`, `2:1122`, `2:1025` | UI sim nos nodes |
| 8 | Nutrition | `2:817` / `15:1436` | UI sim nos nodes |
| 9 | AI | coach `2:944`, alteração `10:2651`, admin IA `2:2954` | UI sim nos nodes |
| 10 | Admin | 7 screens Dark + Light | UI sim; Treinamento/Nutrição/Settings **FIGMA_PENDING** |
| 11 | Hardening | conforme telas existentes | após fluxos reais |
| 12 | Vercel | app navegável | só com critérios da spec |

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

Permissions testadas (integration).

---

## 5. Phase 3 — Domain

Camadas em `src/` (nomes ajustáveis, responsabilidades não):

```text
src/domain/          # regras puras, zero I/O
src/application/     # casos de uso
src/server/repositories/
src/server/services/
```

Módulos:

| Módulo | Primeira fatia |
| --- | --- |
| athlete | perfil, idade derivada, preferências |
| measurement | append-only |
| gym | academias, membership, inventário |
| equipment | canônico vs modelo vs inventário |
| exercise | canônico, variante, alias |
| training | hierarquia programa → série |
| timer | `started_at` / `expected_end_at` |
| recovery | check-in + tendência |
| nutrition | alvos e check-ins |
| ai | contrato versionado + contexto estruturado |
| plates | calculadora com testes extensivos |

GraphQL operations tipadas por domínio; repositórios escondem Hasura.

---

## 6. Phase 4 — Auth + Onboarding

Backend: signup, login, logout, verify email, reset password, session refresh, route guards server-side, roles.

UI definitiva **somente** com nodes da tabela em `FIGMA_IMPLEMENTATION.md`. `/forgot-password` permanece `FIGMA_PENDING`. Auth desktop: adaptar mobile + tokens, sem inventar landing.

Social login preparado em `nhost.toml`, desligado até haver providers. Botões Google/Apple existem no Figma (D-017).

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

UI de execução: `2:372`, timer `10:758` (−15/+15/+30, pausar, reiniciar, pular), supersérie `10:2584`, drop-set `15:1109`, aquecimento `10:2757`. Desktop de sessão: `15:570`. Sem frames de execução desktop detalhada.

---

## 9. Phases 7–8 — Longitudinal + nutrição

Append-only. IA usa tendências, não ponto único. Nomes por extenso na UI e nas respostas da IA.

Nodes: recuperação `2:499`, corpo `2:1122`, evolução `2:1025`, nutrição `2:817` / desktop `15:1436`.

---

## 10. Phase 9 — AI

```text
ai/agents/  ai/skills/  ai/policies/  ai/evaluators/
```

Fluxo: contexto → safety → programa → recovery → desempenho → strength → periodização → nutrição (se necessário) → progress → QA → resposta.

Execução em **Nhost Functions** (chaves de modelo nunca no cliente). Rate limit. Audit (`ai_runs`, `ai_decisions`) sem chain-of-thought.

Admin “Contrato da IA”: `2:2954` / Light `15:6902`. Coach atleta: `2:944`. Alteração pontual: `10:2651`. Versionamento de contrato no banco desde o schema.

---

## 11. Phase 10 — Admin

Desktop-first. Screens: dashboard, usuários, IA, auditoria, exercícios, equipamentos, inventário. Sidebar Dark ainda cita Treinamento, Nutrição e Configurações **sem screen** → `FIGMA_PENDING`. Proteção server-side + role Hasura. Sem UI genérica.

---

## 12. Phase 11 — Hardening

Security review, testes de permission, a11y AA, offline do treino, observabilidade, performance.

---

## 13. Phase 12 — Vercel

Somente quando:

- `build` / lint / typecheck / testes críticos passam
- Auth e Nhost funcionam
- Fluxo navegável (mesmo que Figma cubra só parte das telas)
- Secrets fora do git

Preview em PRs; Production em `main` após aprovação humana.

---

## 14. Git

Especificação: `main`, `develop`, `feature/*`, `fix/*`.

Este PR: `cursor/phase-0-pre-implementation-audit-c3ef` → `main` (ambiente Cloud Agent).

Após Phase 1:

1. Criar `develop` a partir de `main`.
2. Features seguintes → `develop`.
3. Commits pequenos. Proibido “implement entire app”.

---

## 15. Testes por fase

| Fase | Foco |
| --- | --- |
| 1 | config, tokens, theme |
| 2 | permissions GraphQL, trigger profile |
| 3 | plate calc, timer math, validações Zod |
| 4 | auth flows (integration) |
| 5 | inventário + anilhas |
| 6 | persistência de série + idempotência |
| 9 | contrato IA + recusa de fabricar dados |
| 11 | e2e Playwright da spec §56 quando houver UI |

---

## 16. Definition of Done (feature)

Só “pronta” com: lógica, persistência, autorização, validação, testes, loading, error, empty, a11y, responsivo, Light, Dark, fidelidade Figma **quando o design existir**.

Se Figma não existir para aquela rota: DoD de backend (lógica + persistência + authz + testes) com flag `FIGMA_PENDING` na feature. Rotas com node na tabela **não** usam placeholder genérico.
