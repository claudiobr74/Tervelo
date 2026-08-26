# Arquitetura

Camadas (Phase 1+):

```text
src/app/                 # rotas Next.js App Router
src/components/          # UI (tokens Figma)
src/lib/auth/             # papéis user/admin e matriz Hasura
src/lib/nhost/           # adapters Nhost (borda)
src/lib/theme.ts         # preferência de tema, sem Zustand
src/graphql/<domínio>/   # documents GraphQL (Phase 2+)
src/domain/              # regras puras (Phase 3)
src/application/         # casos de uso (Phase 3)
src/server/              # repositórios e services (Phase 3)
nhost/                   # CLI Nhost (Phase 2)
functions/               # HTTP IA/webhooks (Phase 2)
```

Fluxo: UI → application → domain → repository → Hasura/Nhost.

Autorização no backend (Hasura permissions + roles JWT). Frontend não é a barreira.

Tema: `light | dark | system`, persistido em `localStorage` (`tervelo-theme`), classe `.dark` no `<html>`.
