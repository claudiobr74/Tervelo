# Testes

| Camada | Ferramenta | Onde |
| --- | --- | --- |
| Unitário | Vitest | `src/**/*.test.ts` |
| E2E | Playwright | `e2e/` (smoke; produto depois das telas Figma) |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

Phase 2 cobre schema Nhost, papéis `user`/`admin` e a matriz Hasura (`src/lib/auth/permission-matrix.ts`).

Phase 3 cobre calculadora de anilhas, timer por timestamp, idade derivada, append-only e validações Zod (`src/domain`, `src/application`).

Permissions GraphQL contra `nhost up` ficam para o operador (Docker). Codegen GraphQL idem.

UI de produto: Playwright da spec só quando o fluxo Figma existir.
