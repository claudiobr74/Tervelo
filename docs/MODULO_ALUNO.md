# TERVELO — MÓDULO ALUNO

Prompt permanente das fases de produto do **atleta**. Não cobre o console admin (Phase 10).

## Superfície

- Login, cadastro, onboarding
- App do aluno: `/app/*` (hoje, treino, recuperação, evolução, corpo, nutrição, coach, configurações de dispositivos)
- Role JWT: `user`
- Figma: `03 — Athlete Desktop` (`2:3`) e `04 — Athlete Mobile` (`2:4`)
- Conteúdo atleta em max-width **390px**. Sem status bar iOS nem home indicator (D-016)
- Light = variante de token, não layout duplicado

## Fases deste módulo

| Fase | Superfície |
| --- | --- |
| 4 | Auth + onboarding |
| 5 | Busca de exercícios e anilhas **do aluno** (admin da Phase 5 fica fora deste prompt) |
| 6 | Motor de treino |
| 7 | Recuperação, corpo e evolução |
| 8 | Nutrição |
| 9 | Coach / IA no app do aluno |
| 11 | Frequência cardíaca (Web Bluetooth real, opcional) |
| 12 | Estado do Atleta, Check-in Pré-Treino, Check-out Pós-Treino, Revisão Semanal do Coach |
| 13 | Funcionamento offline (treino, check-ins, medidas, nutrição essencial, PWA) |

## Regras ao implementar

1. UI definitiva só com node Figma + `get_design_context`. Sem node = `FIGMA_PENDING`.
2. Histórico longitudinal é append-only.
3. Copy em PT-BR, nomes por extenso.
4. Backend Nhost. Sem Supabase, Firebase ou secrets no cliente.

## Evidência das próximas fases

**Apenas imagens das telas** (Light e Dark, viewport 390px). **Vídeo não é necessário.**
