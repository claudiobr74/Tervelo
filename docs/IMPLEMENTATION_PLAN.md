# TERVELO — Plano de implementação

Dependências: `PRE_IMPLEMENTATION_AUDIT.md`, `DATABASE_DESIGN.md`, `NHOST_ARCHITECTURE.md`, `FIGMA_IMPLEMENTATION.md`, `DECISIONS_REQUIRED.md`.

Veredito atual: **READY_WITH_FIXES**. Phase 1 pode iniciar após merge desta auditoria.

---

## 1. Princípios

1. Segurança e autorização no backend (Hasura + Functions). Frontend nunca é a barreira.
2. Figma prevalece para UI. Sem tela = sem UI definitiva.
3. Domínio desacoplado de React e de strings GraphQL.
4. Histórico longitudinal nunca é sobrescrito.
5. IA não inventa dados ausentes; memória vem do banco.
6. Sem Supabase, Firebase ou secrets no cliente.
7. Vercel só na Phase 12.

---

## 2. Ordem das fases

| Fase | Nome | UI Figma | Pode começar |
| --- | --- | --- | --- |
| 0 | Auditoria | — | concluída neste PR |
| 1 | Foundation | tokens apenas | sim |
| 2 | Nhost | não | sim |
| 3 | Domain | não | sim |
| 4 | Auth + Onboarding | **aguarda Figma** | backend sim; UI não |
| 5 | Exercise & Equipment | catálogo pode ser interno | sim (domínio + admin data) |
| 6 | Training Engine | **aguarda Figma** para execução visual | domínio + persistência sim |
| 7 | Recovery + Body + Progress | **aguarda Figma** | persistência sim |
| 8 | Nutrition | **aguarda Figma** | persistência sim |
| 9 | AI | admin contract **aguarda Figma** | orquestração sim |
| 10 | Admin | **aguarda Figma** (desktop-first) | APIs/permissions sim |
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
- CSS variables Light/Dark (Theme System) + `prefers-color-scheme` + persistência
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

UI definitiva **somente** com nodes Figma. Até lá: `FIGMA_UI_PENDING`.

Social login preparado em `nhost.toml`, desligado até haver tela e providers.

---

## 7. Phase 5 — Exercise & Equipment

- Catálogo escalável (aliases, não duplicar fabricantes)
- Inventário por academia: máquinas, barras (peso real), anilhas (não enum), halteres (lista ou min/max/increment)
- Algoritmo de anilhas: carga desejada → discos por lado, simetria, menor quantidade, inventário real
- Testes unitários cobrindo 0.5–25 kg, barra 20 kg, impossível, ímpar, estoque insuficiente

UI de biblioteca **aguarda Figma**.

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

UI de execução **aguarda Figma** (incluindo +15/+30/−15, pausar, reiniciar, pular).

---

## 9. Phases 7–8 — Longitudinal + nutrição

Append-only. IA usa tendências, não ponto único. Nomes por extenso na UI e nas respostas da IA.

---

## 10. Phase 9 — AI

```text
ai/agents/  ai/skills/  ai/policies/  ai/evaluators/
```

Fluxo: contexto → safety → programa → recovery → desempenho → strength → periodização → nutrição (se necessário) → progress → QA → resposta.

Execução em **Nhost Functions** (chaves de modelo nunca no cliente). Rate limit. Audit (`ai_runs`, `ai_decisions`) sem chain-of-thought.

Admin “Contrato da IA” **aguarda Figma**. Versionamento de contrato no banco desde o schema.

---

## 11. Phase 10 — Admin

Desktop-first. Áreas da spec. Proteção server-side + role Hasura. Sem UI genérica.

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

Se Figma não existir: DoD de backend (lógica + persistência + authz + testes) com flag `FIGMA_PENDING` na feature.
