# TERVELO

SaaS de treinamento de musculação, evolução corporal, recuperação, nutrição esportiva e acompanhamento longitudinal com inteligência artificial.

O diferencial não é gerar fichas. É compreender o atleta, o local de treino, os equipamentos e o histórico de cada série.

## Estado do projeto

Phase 0 (auditoria) concluída. Phase 1: app Next.js. Phase 2: Nhost com usuário/administrador. Phase 3: domínio. Phase 4: **login, cadastro e onboarding** (Figma).

UI de produto só a partir dos nodes em [`docs/FIGMA_IMPLEMENTATION.md`](docs/FIGMA_IMPLEMENTATION.md). Login/admin screens entram nas Phases 4 e 10.

## Acesso

| Acesso | Role JWT | Superfície (quando houver Figma) |
| --- | --- | --- |
| Usuário / atleta | `user` | `/app/*` |
| Administrador | `admin` | `/admin/*` |
| Super admin | `super_admin` | auditoria e contratos de IA |

Admin **não** é criado no cadastro. Operador promove com SQL em `auth.user_roles` — ver [`nhost/README.md`](nhost/README.md).

Detalhes da auditoria: [`docs/PRE_IMPLEMENTATION_AUDIT.md`](docs/PRE_IMPLEMENTATION_AUDIT.md).

## Fontes de verdade

| Ordem | Fonte |
| --- | --- |
| 1 | Regras de segurança |
| 2 | Especificação funcional (prompt mestre) |
| 3 | [Figma](https://www.figma.com/design/uJxhUZVuIzCpFL94dtQj0G/TERVELO-%E2%80%94-Design-System---Product) — file `uJxhUZVuIzCpFL94dtQj0G` |
| 4 | PostgreSQL / Nhost (`wqttndghxeybdppcfnol`) |
| 5 | Configurações administrativas publicadas |
| 6 | Decisões de implementação |

Conflitos: [`docs/DECISIONS_REQUIRED.md`](docs/DECISIONS_REQUIRED.md).

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [PRE_IMPLEMENTATION_AUDIT.md](docs/PRE_IMPLEMENTATION_AUDIT.md) | Auditoria Figma, GitHub, Nhost, gaps |
| [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Fases 1–12 |
| [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | Schema PostgreSQL |
| [NHOST_ARCHITECTURE.md](docs/NHOST_ARCHITECTURE.md) | Auth, Hasura, Storage, Functions |
| [FIGMA_IMPLEMENTATION.md](docs/FIGMA_IMPLEMENTATION.md) | Tokens (`28:527`), mapa rota→node, `FIGMA_UI_PARTIAL` |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Camadas do código |
| [SECURITY.md](docs/SECURITY.md) | Secrets, roles, CI |
| [TESTING.md](docs/TESTING.md) | Vitest, Playwright, CI |
| [MODULO_ALUNO.md](docs/MODULO_ALUNO.md) | Prompt **TERVELO — MÓDULO ALUNO** (fases do atleta) |
| [IA_PROMPT_MESTRE.md](docs/IA_PROMPT_MESTRE.md) | Prompt **TERVELO — PROMPT MESTRE DE IMPLEMENTAÇÃO DA INTELIGÊNCIA ARTIFICIAL** |
| [IA_ADDENDUM.md](docs/IA_ADDENDUM.md) | **TERVELO — ADDENDUM** — integração treino e nutrição esportiva |

## Stack

- Frontend: Next.js 16 (App Router), TypeScript strict, Tailwind v4, CSS variables, Manrope, Lucide
- Backend: **Nhost** (PostgreSQL, Hasura GraphQL, Auth, Storage, Functions)
- **Não** usar Supabase

## Desenvolvimento

```bash
cp .env.example .env.local
npm install
npm run dev          # frontend
npm exec nhost -- up # backend local (Docker)
```

Rotas desta fase:

- `/` — scaffold interno (não é a landing de marketing)
- `/login` — Figma `2:1428`
- `/signup` — Figma `2:1478`
- `/onboarding/*` — perfil, medidas, experiência, objetivos, nutrição
- `/dev/tokens` — paleta e primitivos
- `/app/nutrition` — Figma `2:817`
- `/app/coach` — Figma `2:944`
- `/app/coach/ajuste` — Figma `10:2651`
- `/admin` — Figma `2:2503`
- `/admin/users` — Figma `2:2659`
- `/admin/audit` — Figma `2:3112`
- `/api/health` — liveness

Scripts: `lint`, `typecheck`, `test` (Vitest), `test:e2e` (Playwright, fora do CI), `build`.

Tema padrão: **escuro**. Persistência em `localStorage` (`tervelo-theme`). Tokens CSS: Handoff Figma `28:527`.

Não commitar `.env`. Secrets de IA e admin secret Nhost nunca vão para o cliente.
