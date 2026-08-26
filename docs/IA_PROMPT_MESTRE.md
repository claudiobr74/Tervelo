# TERVELO — PROMPT MESTRE DE IMPLEMENTAÇÃO DA INTELIGÊNCIA ARTIFICIAL

Prompt permanente do **módulo de IA**. Não substitui o Figma nem as policies no código.

Cobre o contrato administrativo e o pipeline de agentes. O coach do atleta (`/app/coach`) continua no **TERVELO — MÓDULO ALUNO** (Phase 9).

## Onde vive

- Admin: `/admin/ai` — contrato, escolha de agente (Dark `2:2954`, Light `15:6902`)
- App do aluno: `/app/coach` (Phase 9, node `2:944`) e alteração pontual (`10:2651`)
- Execução: Nhost Functions (`functions/ai/`). Chaves de modelo **nunca** no cliente
- Persistência: `ai_contracts`, `ai_contract_versions`, `ai_contract_publications`, `ai_runs`, `ai_decisions`

## Agentes (pipeline)

Escolha operacional no **modo administrar** (`/admin/ai`, aba Comportamento). Nomes por extenso na UI. O Figma não tem picker; a seleção existe porque o pipeline precisa de um agente em foco.

| Identificador | Nome na UI |
| --- | --- |
| `orchestrator` | Orquestrador |
| `profiler` | Perfilador |
| `strength` | Força |
| `periodization` | Periodização |
| `nutrition` | Nutrição |
| `recovery` | Recuperação |
| `progress` | Evolução |
| `qa` | Controle de qualidade |

Padrão: Orquestrador. Fluxo: contexto → segurança → programa → recuperação → desempenho → força → periodização → nutrição (se necessário) → evolução → controle de qualidade → resposta.

## Regras que o contrato **não** pode desligar

Ficam em `src/domain/ai` e `ai/policies`, não no JSON configurável:

1. Não fabricar dados ausentes; memória vem do banco.
2. Tendências exigem janela (≥3 pontos), não um ponto único.
3. Histórico longitudinal é append-only.
4. Publicar contrato só com papel `super_admin`.
5. Sem chain-of-thought em `ai_decisions` (só racional curto objetivo).
6. Isolamento por `user_id`. Rate limit na Function.

## Identidade padrão (Figma)

> Você é o Coach de IA do Tervelo. Auxilia atletas a atingirem hipertrofia mantendo sua segurança física como prioridade número 1. Ajuste cargas baseando-se no feedback de fadiga do dia.

Prioridades: segurança física contra lesões; aderência ao cronograma de treino; evolução de carga controlada; performance esportiva.

Tom padrão: Técnico + Motivacional.

Matriz de autonomia (nomes por extenso): progressão de carga → Confirmar; volume de treino → Auto; substituição de exercício → Sugerir; ajuste nutricional → Confirmar.

## Addendum

Complemento obrigatório: [`docs/IA_ADDENDUM.md`](IA_ADDENDUM.md) — integração treino + nutrição + composição + recuperação + aderência.

Não substitui este prompt nem as regras protegidas de segurança. `NUTRITION_CONTEXT` é obrigatório quando houver dados nutricionais. QA 13–20 falha conflito grave.

## Evidência

**Apenas imagens das telas** (Light e Dark). **Vídeo não é necessário.** Admin é desktop-first.
