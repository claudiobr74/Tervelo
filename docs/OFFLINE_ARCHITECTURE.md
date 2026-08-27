# Arquitetura offline

Princípio: **local first na execução** + **servidor como fonte de verdade após sincronização**.

```text
INTERFACE
  ↓
CAMADA DE APLICAÇÃO
  ↓
RepositorioLocal (IndexedDB)
  ↓
Fila de Sincronização
  ↓
Motor de Sincronização
  ↓
Nhost / Hasura
```

Funções críticas do treino **não** esperam mutation GraphQL para confirmar a UI.

## Camadas

| Pasta                 | Papel                                              |
| --------------------- | -------------------------------------------------- |
| `src/domain/offline/` | Fila, motor, conflitos, backoff, copy PT-BR (puro) |
| `src/lib/offline/`    | IndexedDB, boot, transporter, rede, SW             |
| Stores existentes     | Continuam cache em memória; persistem no IDB       |

## Capacidades

- **OFFLINE_CRITICAL:** sessão, séries, timer, check-ins, eventos, FC já conectada, finalizar.
- **OFFLINE_SUPPORTED:** plano já sincronizado, histórico recente, medidas, nutrição, perfil, biblioteca da sessão.
- **ONLINE_REQUIRED:** Coach remoto, geração de programa, revisão ainda não gerada, admin, busca remota.

## Source of truth

Depois do ack: PostgreSQL/Nhost. IndexedDB permanece cache operacional, trabalho e fila pendente.

## Isolamento

Chaves e fila particionadas por `user_id`. Logout não apaga pendências silenciosamente.

## Admin

`/admin/*` exige conexão nesta fase.
