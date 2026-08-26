# Testes

| Camada | Ferramenta | Onde |
| --- | --- | --- |
| Unitário | Vitest | `src/**/*.test.ts` |
| E2E | Playwright | `e2e/` (smoke; produto depois das telas Figma) |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

Phase 2 cobre schema Nhost, papéis `user`/`admin` e a matriz Hasura (`src/lib/auth/permission-matrix.ts`).

Phase 3+ exige testes extensivos da calculadora de anilhas, timer por timestamp e permissions GraphQL contra `nhost up`.

UI de produto: Playwright da spec só quando o fluxo Figma existir.
