# Motor de Sincronização

Serviço: `runSyncPass` (`src/domain/offline/engine.ts`) + `requestSync` (`src/lib/offline/engine-runner.ts`).

## Fila

Cada operação: `id`, `tipo`, `entidade`, `entity_id`, `payload`, `created_at`, `updated_at`, `attempt_count`, `last_attempt_at`, `status`, `error_code`, `dependency_ids`, `schema_version`, `client_mutation_id`, `occurred_at`, `synced_at`, `user_id`, `priority`, `lane`.

Estados: `PENDENTE` → `SINCRONIZANDO` → `SINCRONIZADO` | `ERRO_RECUPERAVEL` | `ERRO_PERMANENTE`.

## Ordem

1. Sessão ativa
2. Séries
3. Finalização
4. Check-ins
5. Frequência cardíaca
6. Medidas
7. Nutrição
8. Restante

Lane `FILE` não bloqueia lane `DATA`. Filho não sai antes do pai (`dependency_ids`).

## Idempotência

Enqueue e transporter usam `client_mutation_id`. Unicidade no banco (`set_results`, check-ins, samples) faz retry virar `already_applied`, não duplicata.

`occurred_at` é o instante local do evento. `synced_at` é o ack. Não confundir.

## Retry

Backoff 1s → 2s → 4s → 8s → 16s → 30s. Ao recuperar conexão ou “Sincronizar agora”, `forceRetry`.

Recuperáveis: rede, timeout, `nhost_unavailable`, 429. Permanentes: permissão, schema, entidade removida.

## Disparos

- `online`
- foreground / `visibilitychange`
- abertura do app (boot)
- ação manual

Background Sync do browser é opcional e **não** é a única via. Preview local (`Nhost subdomain=local`) mantém pendências; não marca sucesso falso.

## Observabilidade

Métricas: `sync_success`, `sync_failure`, `pending_operations`, `sync_latency`, `conflict_count`, `offline_session_started`, `offline_session_completed`, `recovered_active_session`. Logs só com metadados técnicos.
