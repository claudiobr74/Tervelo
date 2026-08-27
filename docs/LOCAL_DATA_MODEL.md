# Modelo de dados local

Banco IndexedDB: `tervelo-offline` (versão 1). Migrations no `onupgradeneeded`. Não apagar o banco a cada update.

## Stores

| Store        | Chave        | Conteúdo                         |
| ------------ | ------------ | -------------------------------- |
| `kv`         | `userId:key` | Documentos por usuário           |
| `sync_queue` | `id`         | Fila de operações                |
| `meta`       | `key`        | lastSyncedAt e flags de migração |

## Documentos KV

- `live-session` — sessão ativa, séries, timer (`startedAt` / `expectedEndAt`), eventos
- `prescription-snapshot` — prescrição congelada no início da sessão
- `heart-rate-session` — samples em lote, wearable
- `athlete-state` — check-in/out, fila local, revisões já geradas
- `longitudinal` — medidas e recuperação
- `nutrition` — hidratação extra, aderência de refeições, check-ins
- `catalog-today` — sessão de hoje / próxima
- `last-synced-at`

## O que não vai no IDB

Service secrets, admin secrets, chaves privadas. Tema e toggles pequenos podem permanecer em `localStorage`.

## Retenção

Manter sessão ativa, semana atual, próximas sessões, histórico recente, pendências. Samples de FC já sincronizados podem ser resumidos. Não apagar a fila pendente.

## Timezone

UTC interno + `occurred_at` original. A série aconteceu quando foi registrada, não quando chegou ao servidor.
