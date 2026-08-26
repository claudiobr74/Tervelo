# Testes

| Camada | Ferramenta | Onde |
| --- | --- | --- |
| Unitário | Vitest | `src/**/*.test.ts` |
| E2E | Playwright | `e2e/` (smoke; produto depois das telas Figma) |
| CI | GitHub Actions | `.github/workflows/ci.yml` |

Phase 2 cobre schema Nhost, papéis `user`/`admin` e a matriz Hasura (`src/lib/auth/permission-matrix.ts`).

Phase 3 cobre calculadora de anilhas, timer por timestamp, idade derivada, append-only e validações Zod (`src/domain`, `src/application`).

Permissions GraphQL contra `nhost up` ficam para o operador (Docker). Codegen GraphQL idem.

Phase 4: Playwright cobre login/cadastro visíveis e o redirect do onboarding sem sessão.

Phase 6: Vitest cobre volume sem aquecimento, descanso de supersérie/drop e fila idempotente de `set_results`. Playwright cobre hoje → iniciar → registrar série → timer → pular.

Phase 7: Vitest cobre mapeamento dos sliders (direita = melhor; dor/estresse invertidos no domínio), massa magra e delta append-only. Playwright cobre hoje → recuperação → confirmar → evolução → corpo, no viewport 390 e no tema claro.

**TERVELO — MÓDULO ALUNO** (Phase 8+): evidência de UI só com screenshots das telas (Light e Dark, 390px). Vídeo não é necessário.
