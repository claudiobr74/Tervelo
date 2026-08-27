# Decisões requeridas

Conflitos reais entre fontes de verdade. **Não foram resolvidos silenciosamente.**

Status da Fase 0: `READY_WITH_FIXES`.

---

## D-001 — Tokens Light: Foundations vs Theme System

**Fontes:** Figma `foundations-tokens` (`10:1253`) vs `Theme System — Light & Dark` (`15:3419`).

| Token            | Foundations (Light — “Em preparação”) | Theme System Light                                                                     |
| ---------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| Background       | `#FFFFFF`                             | Background/Primary `#FFFFFF`                                                           |
| Surface          | `#F9FAFB`                             | Surface/Primary `#FFFFFF`; Surface/Secondary `#F3F4F6`; Background/Secondary `#F8F9FA` |
| Surface Elevated | `#FFFFFF`                             | Background/Elevated `#FFFFFF`                                                          |
| Text Secondary   | `#6B7280`                             | Text/Secondary `#4B5563`; Text/Tertiary `#6B7280`                                      |
| Brand Primary    | não diferenciado (`#F59E0B`)          | Brand/Primary `#D97706`                                                                |
| Success          | `#10B981`                             | Status/Success `#059669`                                                               |
| Info             | `#6366F1` (Indigo)                    | Status/Info `#2563EB`                                                                  |

**Proposta de implementação (pendente de aprovação):**

- Theme System é a fonte de tokens semânticos Light/Dark **quando o Handoff `28:527` não cobrir**.
- Handoff `28:527` prevalece para **nomes CSS e valores copy-paste** (D-012).
- Foundations permanece fonte de ícones Lucide, Display 48px de marketing, motion de countdown/números.
- Mapear `Text Secondary` de Foundations para `text.tertiary` no código.

**Impacto se não decidir:** CSS variables inconsistentes entre temas.

---

## D-002 — Tokens Dark: borda e superfície

| Token            | Foundations Dark | Theme System Dark                                       |
| ---------------- | ---------------- | ------------------------------------------------------- |
| Border           | `#2E3340`        | Border/Default `#2A2E3B`                                |
| Surface Elevated | `#242833`        | Surface/Secondary `#242833`; Overlay Level 03 `#2A2E3B` |
| Background       | `#0F1117`        | Background/Primary `#0F1117`                            |
| Surface          | `#1A1D27`        | Surface/Primary `#1A1D27`                               |

Theme System introduz tokens ausentes em Foundations: `Background/Secondary` (`#161920`), `Surface/Interactive` (`#2A2E3B`), `Text/Tertiary` (`#6B7280`).

**Proposta:** usar Theme System; tratar `#2E3340` de Foundations como valor legado, não implementar.

---

## D-003 — Brand/Primary diferente por tema

- Dark: `#F59E0B`
- Light: `#D97706`

Isso **não** é inversão automática. O contraste WCAG do Theme System justifica amber mais escuro no Light.

**Proposta:** aceitar valores distintos por tema. Não usar `#F59E0B` no Light.

---

## D-004 — Secondary (Blue) vs Status/Info

Foundations define Secondary (Blue) `#3B82F6` como “Ação Secundária”.

Theme System não tem token `Brand/Secondary`. Azul aparece como Status/Info (`#3B82F6` Dark / `#2563EB` Light).

Showcase de botões: Primary / Secondary / Ghost — Secondary visual não está especificado como token.

**Pergunta:** Secondary de botão usa azul `#3B82F6`/`#2563EB` ou superfície/borda neutra?

**Proposta:** Secondary = botão outlined/neutro; azul fica em Status/Info. Registrar se o design de componentes discordar.

---

## D-005 — Copy do showcase não é de musculação

Theme System usa “Projeto Alpha” e “dados fiscais integrados” no card de exemplo.

**Proposta:** ignorar essa copy no produto. Não criar domínio fiscal. Quando houver tela real, usar vocabulário de treino.

---

## D-006 — Geist Mono no Figma

Hex codes do Theme System usam Geist Mono. A UI do produto está especificada em **Manrope**.

**Proposta:** Manrope em toda UI. Mono apenas se o Figma de produto pedir (ex.: códigos, IDs internos). Não adotar Geist Mono como fonte do app.

---

## D-007 — Bibliotecas Figma genéricas anexadas

O arquivo assina Material 3, Simple Design System e kits Apple (iOS/macOS/watchOS/visionOS). Não há biblioteca TERVELO publicada.

**Risco:** instâncias genéricas vazarem para telas futuras.

**Proposta:** telas de produto devem usar apenas tokens TERVELO. Não implementar Material 3 nem SDS.

---

## D-008 — Git workflow: `feature/*` vs `cursor/*`

A especificação pede `feature/*` e `develop`. Este ambiente Cloud Agent exige `cursor/<nome>-c3ef` para PRs automáticos.

**Proposta:** PRs deste agente usam `cursor/*-c3ef` → `main` até `develop` existir. Depois: `cursor/*` ou `feature/*` → `develop` → `main`.

---

## D-009 — Conexão Nhost ↔ GitHub

O projeto Nhost `wqttndghxeybdppcfnol` existe, mas este workspace não tem credenciais de console nem confirmação de GitHub App.

**Necessário do operador:**

1. Vincular `claudiobr74/Tervelo` ao projeto Nhost.
2. Informar `subdomain` e `region` para `.env.example`.
3. Confirmar se o schema cloud ainda está vazio.

Sem isso, Phase 2 local (`nhost init` / `nhost up`) avança; deploy cloud não.

---

## D-010 — Tenant B2C vs organização

MVP é B2C. Especificação pede SaaS multi-tenant futuro sem espalhar `organization_id`.

**Proposta em `DATABASE_DESIGN.md`:**

- Dono atual = `user_id` (atleta).
- Catálogos globais sem tenant.
- `organization_id` apenas em `gyms` (nullable) e em tabelas de atribuição futura (`coach_client_links` — não criar agora).
- Não adicionar `organization_id` em medições, séries ou check-ins.

---

## D-011 — Figma Variables ausentes

`get_variable_defs` no arquivo retornou vazio. Tokens são swatches visuais, não Variables.

**Proposta:** implementar CSS variables no código a partir do Handoff `28:527` + Theme System. Pedir ao design converter para Figma Variables depois (não bloqueia código).

---

## D-012 — Vocabulário CSS: Handoff `28:527` vs auditoria inicial

A auditoria inicial propôs `--color-background-primary`. O Handoff copy-paste usa `--bg-primary`, `--surface-*`, `--brand-*`, `--status-*`, mais `--surface-hover/pressed`, `--border-strong/subtle`, `--brand-secondary/accent`.

**Proposta:** o CSS do produto segue **`28:527`**. Aliases da spec funcional apontam para esses nomes. Não manter dois vocabulários.

**Impacto se não decidir:** tokens duplicados e componentes misturando hex.

---

## D-013 — Tipografia Handoff vs Foundations

| Estilo   | Foundations         | Handoff (`15:2898` / `28:527`) |
| -------- | ------------------- | ------------------------------ |
| Display  | 48px / LH 1.2 / 700 | 32px / 40 / 700                |
| H1       | 32px / 700          | 24px / 32 / 700                |
| Caption  | 11px / 400          | 12px / 16 / 400                |
| Overline | ausente             | 10px / 14 / 500                |

**Proposta:** escala do handoff na **app**. Display 48px só na landing (`2:1865`) e no DS. Seguir `get_design_context` se uma tela divergir.

---

## D-014 — Radius e motion Handoff vs Foundations

- Radius: Foundations badges **4px**; Handoff `--radius-sm: 6px`.
- Motion: Foundations 150 / **250** / 300 + countdown **1s** + números **400ms**. Handoff 150 / **200** / 300.

**Proposta:** radius e transitions de UI = handoff. Countdown 1s e animação de número 400ms = tokens extras do domínio de treino. Badges 4px se o Components page mostrar 4px no `get_design_context`.

---

## D-015 — Zustand no Handoff

`28:527` inclui `stores/themeStore.ts` com Zustand persist `tervelo-theme`.

**Proposta:** persistir `light | dark | system` no app. **Não** acoplar domínio a Zustand. Provider Next.js + `classList`/ `data-theme` é suficiente. Zustand só se a Phase 1 escolher essa lib explicitamente.

---

## D-016 — Frames mobile 402 vs grid 390

Telas Dark de atleta estão em frames **402×874** (chrome de device). Grid e Light usam **390**. Handoff documenta Mobile 390.

**Proposta:** implementar conteúdo a **390**. Não reproduzir a moldura de status bar iOS como layout do produto (exceto se o `get_design_context` da tela exigir safe-area).

---

## D-017 — Login social no Figma vs spec P3

Login (`2:1428`, `15:7801`) desenha Google e Apple. Spec trata social como P3 / não blocker.

**Proposta:** UI pode mostrar os botões desabilitados ou omitidos até providers Nhost. Não atrasar Auth e-mail. Não ligar OAuth sem tela **e** config Nhost.
