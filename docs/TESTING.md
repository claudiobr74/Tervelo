# Testes

| Camada | Ferramenta | Onde |
| --- | --- | --- |
| Unitário | Vitest | `src/**/*.test.ts` |
| E2E | Playwright | `e2e/` (smoke; produto depois das telas Figma) |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

Phase 1 cobre tema e config Nhost pública.

Phase 3+ exige testes extensivos da calculadora de anilhas, timer por timestamp e permissions GraphQL.

UI de produto: Playwright da spec só quando o fluxo Figma existir.
