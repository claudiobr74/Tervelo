# OFFLINE — Auditoria pré-implementação

Inspeção: 2026-08-27. Complementa a arquitetura existente (Next.js, Nhost, Hasura, Motor de Inteligência, Modo Treino, Timer, Check-ins, Estado do Atleta, Revisão Semanal, Nutrição, Corpo e Medidas, Frequência Cardíaca). **Não substitui** esses módulos.

Veredito: **READY_WITH_FIXES**. Sem P0. Prosseguir.

---

## Superfícies inspecionadas

| Superfície | Situação | Gap |
| --- | --- | --- |
| Next.js 16 App Router | `next.config.ts` simples | Manifest + Service Worker |
| TanStack Query | não utilizado | — |
| GraphQL | documents em `src/graphql/`; HR em `src/lib/heart-rate/sync.ts` | Preview local (`subdomain=local`) **não envia** ao Nhost |
| Treino ativo | `src/lib/training/live-session.ts` persistia **localStorage** | Spec exige IndexedDB |
| Fila de séries | `src/domain/training/offline-queue.ts` — memória + LS; `clientMutationId` | Motor + transporter reais |
| Check-ins | `session-store` + fila em localStorage | IndexedDB |
| Timer | `startedAt` / `expectedEndAt` (não setInterval como verdade) | Persistir com a sessão no IDB |
| FC | buffer + BLE em `runtime.ts`; persistência LS | IDB; internet não corta Bluetooth |
| Medidas / nutrição | preview-store LS; nutrição era estática | IDB + fila |
| Auth | preview local `isLocalNhost()` | Isolar IDB por `user_id`; logout com pendências |
| SW / manifest | inexistentes | PWA |
| Admin | `/admin/*` | Offline **não** exigido nesta etapa |

---

## Prioridades

### P0

Nenhum. O produto não quebra se o offline for implementado sobre o que já existe.

### P1

- Persistir sessão, séries, check-ins, FC e fila em IndexedDB (não localStorage).
- Boot (`bootOffline`) hidrata memória **antes** da UI crítica o suficiente para recuperar sessão após reload.
- Não marcar `SINCRONIZADO` quando Nhost local está indisponível.

### P2

- UI discreta de status; Configurações → Dados e sincronização.
- Coach/IA não finge análise offline.
- Snapshot da prescrição em `SESSION_STARTED`.

### P3

- Fila de arquivos (fotos) separada.
- Background Sync nativo (com fallback).
- Retenção agressiva de mídia/telemetria antiga.

---

## Riscos de e2e

IndexedDB é assíncrono. Testes que só usam `router.push` continuam na memória. Testes de crash usam `page.reload()` e exigem `data-offline-boot="ready"`.

---

## Decisão

Prosseguir na ordem OFF-1 … OFF-17 sem parar na auditoria.
