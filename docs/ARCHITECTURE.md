# Arquitetura

Camadas (Phase 1+):

```text
src/app/                 # rotas Next.js App Router
src/components/          # UI (tokens Figma)
src/lib/auth/            # papéis user/admin e matriz Hasura
src/lib/nhost/           # adapters Nhost (borda)
src/lib/theme.ts         # preferência de tema, sem Zustand
src/graphql/<domínio>/   # documents GraphQL
src/domain/              # regras puras (Phase 3): anilhas, timer, idade, append-only
src/application/         # casos de uso + Zod + portas
src/server/              # adaptadores (Nhost na Phase 4+; fakes em memória nos testes)
nhost/                   # CLI Nhost
functions/               # HTTP IA/webhooks
```

Fluxo: UI → application → domain → repository → Hasura/Nhost.

Autorização no backend (Hasura permissions + roles JWT). Frontend não é a barreira.

Tema: `light | dark | system`, persistido em `localStorage` (`tervelo-theme`), classe `.dark` no `<html>`.
