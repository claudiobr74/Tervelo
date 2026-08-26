# TERVELO

SaaS de treinamento de musculação, evolução corporal, recuperação, nutrição esportiva e acompanhamento longitudinal com inteligência artificial.

O diferencial não é gerar fichas. É compreender o atleta, o local de treino, os equipamentos e o histórico de cada série.

## Estado do projeto

Phase 0 (auditoria) concluída: veredito **READY_WITH_FIXES**. Phase 1 (foundation) neste repositório: Next.js compilando, tokens Light/Dark, primitivos de UI, stub Nhost, testes e CI.

UI de produto só a partir dos nodes em [`docs/FIGMA_IMPLEMENTATION.md`](docs/FIGMA_IMPLEMENTATION.md) (`FIGMA_UI_PARTIAL`). Sem landing, login ou dashboard genérico nesta fase.

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

## Stack

- Frontend: Next.js 16 (App Router), TypeScript strict, Tailwind v4, CSS variables, Manrope, Lucide
- Backend: **Nhost** (PostgreSQL, Hasura GraphQL, Auth, Storage, Functions) — stub na Phase 1
- **Não** usar Supabase

## Desenvolvimento

```bash
cp .env.example .env.local
npm install
npm run dev
```

Rotas desta fase:

- `/` — scaffold interno (não é a landing de marketing)
- `/dev/tokens` — paleta, tipografia, Button/Input/Card e tema claro/escuro/sistema
- `/api/health` — liveness

Scripts: `lint`, `typecheck`, `test` (Vitest), `test:e2e` (Playwright, fora do CI), `build`.

Tema padrão: **escuro**. Persistência em `localStorage` (`tervelo-theme`). Tokens CSS: Handoff Figma `28:527`.

Não commitar `.env`. Secrets de IA e admin secret Nhost nunca vão para o cliente.
