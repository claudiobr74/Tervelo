# TERVELO — Auditoria pré-implementação (Phase 0)

**Data:** 2026-08-26  
**Arquivo Figma:** `uJxhUZVuIzCpFL94dtQj0G`  
**GitHub:** `claudiobr74/Tervelo` (`main` @ `80f3855`)  
**Nhost project:** `wqttndghxeybdppcfnol`  
**Veredito:** `READY_WITH_FIXES`

Esta auditoria **não implementa telas de produto**. Confirma fontes de verdade, gaps e o que pode começar agora.

---

## 1. Resumo executivo

O TERVELO está no ponto correto para **foundation**, não para UI definitiva.

| Superfície | Estado |
| --- | --- |
| Figma | Apenas página `01 — Foundations`. Tokens e Theme System existem. **Nenhuma tela funcional.** |
| GitHub | Repositório quase vazio (`README.md`). Uma branch: `main`. Sem CI, sem proteção. |
| Nhost | Projeto cloud citado. Sem migrations/metadata no repo. Sem evidência de GitHub link neste workspace. |
| Vercel | Ausente, conforme especificação. Não criar agora. |

**FIGMA_UI_PENDING** está registrado. Isso **não** é classificado como erro: a especificação previa Foundations sem telas completas.

---

## 2. Figma

### 2.1 Páginas

| Page ID | Nome | Conteúdo de produto |
| --- | --- | --- |
| `0:1` | `01 — Foundations` | Única página. Documentação de design system. |

Não existem páginas de Auth, Onboarding, App, Admin, Treino, Nutrição, Coach ou Timer.

### 2.2 Frames de primeiro nível

| Node | Nome | Tamanho |
| --- | --- | --- |
| `10:1253` | `foundations-tokens` | 1440 × 4656 |
| `15:3419` | `Theme System — Light & Dark` | 1440 × 2775 |

### 2.3 Foundations — seções

| # | Seção | Node | Status |
| --- | --- | --- | --- |
| 01 | Sistema de Cores | `10:1267` | Completo (ênfase Dark). Light marcado **“Em preparação”**. |
| 02 | Tipografia — Manrope | `10:1394` | Completo |
| 03 | Espaçamentos | `10:1448` | Completo (`TERVELO-Space-1` … `12`) |
| 04 | Sistema de Grids | `10:1501` | Mobile 390 / Desktop 1440. Sem 360 nem 768. |
| 05 | Elevações | `10:1530` | Níveis 0–3 |
| 06 | Raios de borda | `10:1555` | 4 / 8 / 12 / 16 / 24 / Full |
| 07 | Iconografia Lucide 24px / stroke ~1.5 | `10:1590` | Grupos: navegação, treino, corpo, IA, ações |
| 08 | Animações | `10:1692` | 150 / 250 / 300 / 1s linear / 400 ms |

Ordem visual no arquivo: grid (04) aparece antes de radius (06) e elevation (05). Irrelevante para código.

### 2.4 Theme System

Especificação própria de Light e Dark (não é inversão). Inclui:

- Tokens semânticos alinhados (`Background/*`, `Surface/*`, `Text/*`, `Border/Default`, `Brand/Primary`)
- Status: Success / Warning / Error / Info
- Elevação Light (sombra) vs Dark (superfície progressiva)
- Showcase: botões Primary / Secondary / Ghost, input, card, timer `02:45`
- Contraste WCAG 2.1 AA
- Preferência de tema: Claro / Escuro / Usar config. do sistema

### 2.5 Tipografia extraída

Fonte de produto: **Manrope** (não Inter).

| Estilo | Métrica |
| --- | --- |
| Display | 48px / Bold / LH 1.2 |
| Heading 1 | 32px / Bold / LH 1.3 |
| Heading 2 | 24px / SemiBold / LH 1.3 |
| Heading 3 | 20px / SemiBold / LH 1.4 |
| Body Large | 16px / Regular / LH 1.5 |
| Body | 14px / Regular / LH 1.5 |
| Body Small | 12px / Regular / LH 1.4 |
| Label | 14px / Medium / LH 1.2 |
| Caption | 11px / Regular / LH 1.2 |

Caption de exemplo já segue a regra de siglas: **“Repetições em reserva (RIR)”**.

Hex codes no Theme System usam **Geist Mono** (documentação, não UI). Ver D-006.

### 2.6 Cores — Dark (Foundations)

| Token | Hex | Uso |
| --- | --- | --- |
| Primary (Amber) | `#F59E0B` | Ação principal |
| Secondary (Blue) | `#3B82F6` | Ação secundária |
| Success | `#10B981` | Recuperação / concluído |
| Warning | `#F59E0B` | Alerta de carga |
| Danger | `#EF4444` | Esforço crítico / erro |
| Information | `#6366F1` | Dicas |
| Background | `#0F1117` | Fundo |
| Surface | `#1A1D27` | Cards |
| Surface Elevated | `#242833` | Cards destacados |
| Border | `#2E3340` | Bordas |
| Text Primary | `#FFFFFF` | Destaque |
| Text Secondary | `#9CA3AF` | Apoio |
| Text Disabled | `#4B5563` | Não selecionados |

### 2.7 Cores — Light (Foundations, incompleto)

Marcado **“Light Mode — Em preparação”**. Valores parciais: Background `#FFFFFF`, Surface `#F9FAFB`, Elevated `#FFFFFF`, Border `#E5E7EB`, Text Primary `#111827`, Text Secondary `#6B7280`. Sem Text Disabled Light.

### 2.8 Cores — Theme System (fonte semântica)

**Light**

| Token | Hex |
| --- | --- |
| Background/Primary | `#FFFFFF` |
| Background/Secondary | `#F8F9FA` |
| Background/Elevated | `#FFFFFF` |
| Surface/Primary | `#FFFFFF` |
| Surface/Secondary | `#F3F4F6` |
| Surface/Interactive | `#EEF0F3` |
| Text/Primary | `#111827` |
| Text/Secondary | `#4B5563` |
| Text/Tertiary | `#6B7280` |
| Border/Default | `#E5E7EB` |
| Brand/Primary | `#D97706` |
| Status/Success | `#059669` |
| Status/Warning | `#D97706` |
| Status/Error | `#DC2626` |
| Status/Info | `#2563EB` |

**Dark**

| Token | Hex |
| --- | --- |
| Background/Primary | `#0F1117` |
| Background/Secondary | `#161920` |
| Background/Elevated | `#1A1D27` |
| Surface/Primary | `#1A1D27` |
| Surface/Secondary | `#242833` |
| Surface/Interactive | `#2A2E3B` |
| Text/Primary | `#FFFFFF` |
| Text/Secondary | `#9CA3AF` |
| Text/Tertiary | `#6B7280` |
| Border/Default | `#2A2E3B` |
| Brand/Primary | `#F59E0B` |
| Status/Success | `#10B981` |
| Status/Warning | `#F59E0B` |
| Status/Error | `#EF4444` |
| Status/Info | `#3B82F6` |

Contraste declarado (Theme System):

| Combinação | Light | Dark |
| --- | --- | --- |
| Text/Primary on Background | 15.4:1 | 17.1:1 |
| Text/Secondary on Background | 7.2:1 | 4.6:1 |
| Brand/Primary on Background | 4.7:1 | 5.2:1 |
| Timer Display | Extra High | Extra High |

Dark Text/Secondary 4.6:1 está no limite AA para texto normal (≥4.5:1). Caption 11px pode exigir Text/Primary.

### 2.9 Espaçamento

`2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80` px → `TERVELO-Space-1` … `12`.

### 2.10 Grid

- Mobile: 390 px, 4 colunas, margem 16, gutter 16.
- Desktop: 1440 px, 12 colunas, margem 80, gutter 24.
- **Ausente:** 360 px, 768 px (tablet). Validar na implementação mesmo sem grid Figma.

### 2.11 Motion

| Tipo | Duração | Easing |
| --- | --- | --- |
| Microinterações | 150 ms | ease-out |
| Transições de tela | 250 ms | ease-in-out |
| Spring | 300 ms | spring |
| Timer countdown | 1 s | linear |
| Números animados | 400 ms | ease-out |

### 2.12 Iconografia

Lucide, 24 px. Inventário documentado:

- Navegação: home, calendar, trending-up, brain, menu
- Treino: dumbbell, clock, play-circle, heart-pulse, target, award
- Corpo: shield, trending-down, scale, ruler
- IA: sparkles, cpu, bot
- Ações: plus, minus, check, edit, share, settings
- Tema: sun, moon, monitor

Não usar emojis como ícones.

### 2.13 Componentes e estados

- **Não há componentes Figma publicados** do TERVELO (Code Connect indisponível neste plano; `search_design_system` no arquivo retornou vazio).
- Showcase local: botão, input, card, timer estático.
- **Ausentes:** loading, empty, error, focus, disabled, hover além do token Interactive, bottom nav, command palette, controles de timer (+15/−15/pause/skip), onboarding, admin.

### 2.14 Telas faltantes (FIGMA_UI_PENDING)

Todas as rotas de produto da especificação:

`/`, `/login`, `/signup`, `/forgot-password`, `/onboarding/*`, `/app/*`, `/admin/*`.

### 2.15 Bibliotecas anexadas (não usar como UI TERVELO)

Material 3 Design Kit, Simple Design System, iOS/iPadOS 26 e 27, macOS 26 e 27, watchOS 26, visionOS 26.

### 2.16 Figma Variables

`get_variable_defs` retornou objeto vazio. Tokens não estão como Variables — apenas documentação visual.

---

## 3. GitHub

| Item | Achado |
| --- | --- |
| Remote | `https://github.com/claudiobr74/Tervelo` (clone usa `tervelo`; GitHub trata como o mesmo repo) |
| Default branch | `main` |
| Proteção | `protected: false` |
| Branches | somente `main` — sem `develop` |
| PRs | nenhum |
| Arquivos | `README.md` (`# Tervelo`) |
| CI | inexistente |
| `.gitignore` | inexistente |
| Licença / CODEOWNERS | inexistente |
| Secrets no repo | nenhum (repo vazio) |

Primeiro commit: `80f3855` — “Add project title to README”.

---

## 4. Nhost

### 4.1 O que a especificação exige

PostgreSQL, Hasura GraphQL, Auth, Storage, Functions. **Não usar Supabase.** Autorização via Hasura permissions + roles/JWT, não RLS estilo Supabase.

### 4.2 O que este workspace consegue verificar

- Project reference informado: `wqttndghxeybdppcfnol`.
- Dashboard: `https://app.nhost.io/orgs/bddfkiusstbzrfulumvl/projects/wqttndghxeybdppcfnol`.
- **Não há** pasta `nhost/` no repositório.
- **Não há** `nhost.toml`, migrations, metadata, seeds, emails.
- Este ambiente **não tem** credenciais Nhost (subdomain, region, admin secret). Inspeção live do schema cloud **não foi possível**.

### 4.3 Integração oficial (docs Nhost, 2026)

Layout CLI:

```text
nhost/
  emails/
  metadata/
  migrations/
  seeds/
  nhost.toml
functions/          # HTTP handlers (AI, webhooks) — não confundir com src/server
```

Workflow: `nhost init` → `nhost up` → migrations/metadata versionados → GitHub deploy.

SDK frontend atual: `@nhost/nhost-js` (`createClient` / `createServerClient` com cookies no App Router).

Roles JWT: `x-hasura-user-id`, `x-hasura-default-role`, `x-hasura-allowed-roles`. Role `public` para anônimos. Custom claims em `nhost.toml`.

Storage: buckets em `storage.buckets`; permissões na tabela `storage.files`. Preferir URLs pré-assinadas, não públicas permanentes para mídia privada.

Functions: arquivos em `./functions` viram HTTP endpoints; secrets só no servidor (`NHOST_ADMIN_SECRET`, chaves de IA).

### 4.4 Gaps Nhost

| Gap | Severidade |
| --- | --- |
| Repo sem config versionada | P1 |
| GitHub App no projeto cloud não confirmado | P1 |
| Subdomain/region não documentados | P1 |
| Roles `admin` / `super_admin` não configuradas | P1 (Phase 2) |
| Storage buckets de domínio inexistentes | P1 (Phase 2) |
| SMTP / templates PT-BR | P2 |
| Login social | P3 (não blocker de MVP) |

---

## 5. Arquitetura — conflitos e gaps

### 5.1 Conflitos Figma ↔ especificação

Ver `docs/DECISIONS_REQUIRED.md` (D-001 a D-007). Não há conflito que impeça scaffold, tokens CSS, domínio ou banco.

### 5.2 Acoplamento

Especificação exige: UI → application → domain/service → repository. GraphQL/Nhost ficam na borda. **Pode começar agora.**

### 5.3 Estrutura de pastas vs CLI Nhost

A árvore da especificação (`src/server`, `src/graphql`) é válida para o app Next.js. A CLI Nhost **exige** `nhost/` e `functions/` na raiz. Adaptar: domínio em `src/`, adapters Nhost em `nhost/` + `functions/`.

### 5.4 Multi-tenancy

Catálogo global vs dados do atleta. Ver D-010 e `DATABASE_DESIGN.md`.

### 5.5 Timer e offline

Sem tela Figma de controles. Lógica de timer (timestamps, não `setInterval` como fonte de verdade) **pode** ser domínio + testes. UI definitiva aguarda Figma.

---

## 6. Classificação

### P0 — blocker

Nenhum P0 para **Phase 1 Foundation**.

P0 para **UI de produto:** telas Figma inexistentes → **FIGMA_UI_PENDING** (esperado, não erro).

### P1 — must fix (antes ou durante Phases 1–2)

| ID | Item |
| --- | --- |
| P1-01 | Resolver D-001/D-002/D-003 para gerar tokens sem adivinhar |
| P1-02 | Scaffold Next.js + TypeScript strict + lint + testes |
| P1-03 | Versionar `nhost/` (init, toml, roles) |
| P1-04 | `.env.example` sem secrets; obter subdomain/region |
| P1-05 | Vincular GitHub ao Nhost |
| P1-06 | Branch `develop` + CI lint/typecheck/test/build |
| P1-07 | Schema inicial + permissions Hasura versionadas |

### P2 — should fix

| ID | Item |
| --- | --- |
| P2-01 | Converter tokens Figma em Variables |
| P2-02 | Remover ou ignorar bibliotecas genéricas no arquivo Figma |
| P2-03 | Grids 360 / 768 |
| P2-04 | Componentes primitivos no Figma (button, input, tooltip acessível) |
| P2-05 | Templates de e-mail Auth em PT-BR |
| P2-06 | Proteção de `main` no GitHub |
| P2-07 | Copy do showcase (“Projeto Alpha”) |

### P3 — improvement

| ID | Item |
| --- | --- |
| P3-01 | Login social |
| P3-02 | PWA |
| P3-03 | Code Connect quando o plano Figma permitir |
| P3-04 | Vercel (somente Phase 12) |

---

## 7. O que pode começar vs o que espera Figma

### Pode começar

- Scaffold Next.js App Router, TS strict, ESLint, Prettier, Vitest, Playwright (smoke)
- CSS variables Light/Dark a partir do Theme System (com D-001 aberto)
- Manrope, Lucide, motion tokens
- Primitivos **não finais**: focus ring, skip link — sem fingir telas de produto
- Nhost CLI, Auth architecture, GraphQL codegen
- Schema, migrations, permissions
- Domain services: plate calculator, timer, periodização, validação
- Agents/skills/policies (contratos, sem UI)
- Cursor rules, testes unitários extensivos de anilhas
- CI

### Deve aguardar Figma (`FIGMA_UI_PENDING`)

Qualquer tela funcional definitiva: login visual, onboarding, dashboard, sessão de treino, timer UI, nutrição, admin, command palette visual, empty/error/loading de produto.

Não inventar dashboards genéricos.

---

## 8. Veredito

```text
READY_WITH_FIXES
```

**Não BLOCKED:** foundation, domínio, banco e Nhost podem avançar.

**Não GO incondicional:** conflitos de token (D-001–D-004), Nhost não versionado, GitHub sem CI/`develop`, UI de produto pendente.

**Fixes para sair de READY_WITH_FIXES rumo a GO de Phase 1:**

1. Aprovar mapeamento de tokens (Theme System > Foundations para cor semântica).
2. Criar scaffold e `nhost/` no repositório.
3. Operador informar subdomain/region e ligar GitHub no Nhost.

**Blockers de UI de produto (não de Phase 1):**

- Telas Figma inexistentes (`FIGMA_UI_PENDING`).
