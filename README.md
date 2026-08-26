# TERVELO

SaaS de treinamento de musculação, evolução corporal, recuperação, nutrição esportiva e acompanhamento longitudinal com inteligência artificial.

O diferencial não é gerar fichas. É compreender o atleta, o local de treino, os equipamentos e o histórico de cada série.

## Estado do projeto

Phase 0 (auditoria) em andamento. Repositório de foundation — **sem UI de produto definitiva** enquanto o Figma não publicar as telas.

Veredito da auditoria: **READY_WITH_FIXES**. Detalhes em [`docs/PRE_IMPLEMENTATION_AUDIT.md`](docs/PRE_IMPLEMENTATION_AUDIT.md).

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
| [FIGMA_IMPLEMENTATION.md](docs/FIGMA_IMPLEMENTATION.md) | Tokens, gate de UI, `FIGMA_UI_PENDING` |

## Stack (planejada)

- Frontend: Next.js (App Router), TypeScript strict, CSS variables, Manrope, Lucide
- Backend: **Nhost** (PostgreSQL, Hasura GraphQL, Auth, Storage, Functions)
- **Não** usar Supabase

## Desenvolvimento

Ainda não há app compilável. Phase 1 cria o scaffold.

Não commitar `.env`. Secrets de IA e admin secret Nhost nunca vão para o cliente.
