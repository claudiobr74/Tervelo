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

Phase 8: Vitest cobre percentual de target, fluido em litros e recusa de check-in em dia fechado. Playwright cobre hoje → nutrição (390px) no Dark e no Light.

Phase 9: Vitest cobre recusa de fabricar fatos UNKNOWN, seções integradas (Papel da nutrição) e aceite/recusa da proposta. Playwright cobre hoje → Coach → chips/proposta → alteração pontual (390px) no Dark e no Light.

Phase 10: Vitest cobre filtro de usuários e faixa de aderência. Playwright cobre dashboard → usuários → auditoria no desktop (1440), Dark e Light. Atleta sem papel admin volta para a home.

Phase 11: Vitest cobre parser BLE (8/16 bits, flags, inválidos), recuperação, associação temporal, batching/idempotência, toggle e `HEART_RATE_CONTEXT` condicional. Playwright cobre settings desligado → treino sem indicador; ligar o toggle; treino segue sem BLE. Screenshots 390 Light/Dark. Hardware real: `docs/HEART_RATE_HARDWARE_VALIDATION.md`.

**TERVELO — PROMPT MESTRE DE IMPLEMENTAÇÃO DA INTELIGÊNCIA ARTIFICIAL**: Vitest cobre agentes e políticas do contrato. Playwright cobre `/admin/ai` (escolha de agente) no desktop, Dark e Light. Sem vídeo.

**TERVELO — ADDENDUM**: Vitest cobre `NUTRITION_CONTEXT` UNKNOWN, ordem de ajuste e QA 13–20. Playwright cobre a aba Nutrição do contrato admin.
