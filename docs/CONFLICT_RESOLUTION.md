# Resolução de conflitos

Não usar last-write-wins para tudo.

## Separação obrigatória

- **Prescrição** (programa do servidor)
- **Execução** (o que o atleta fez)

## Por domínio

| Domínio | Política |
| --- | --- |
| Sessão ativa local | Dados locais têm prioridade até reconciliar. Não sobrescrever com remoto. |
| Séries / eventos / FC / check-ins | Append-only. Nunca descartar silenciosamente. Preferir `keep_both`. |
| Prescrição com sessão em andamento | Snapshot congelado em `SESSION_STARTED`. Mudança remota vale para **próximas** sessões. |
| Dois dispositivos | Mesclar operações independentes. Se impossível: preservar e reconciliar. |
| Na dúvida | Preservar para reconciliação, nunca perder o registro. |

Implementação: `src/domain/offline/conflict.ts` (`resolveConflict`).
