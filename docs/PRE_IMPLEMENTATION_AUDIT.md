# TERVELO — Auditoria pré-implementação (Phase 0)

**Data:** 2026-08-26  
**Arquivo Figma:** `uJxhUZVuIzCpFL94dtQj0G` (7 páginas; reinspeção completa)  
**GitHub:** `claudiobr74/Tervelo` (`main` @ `80f3855`)  
**Nhost project:** `wqttndghxeybdppcfnol`  
**Veredito:** `READY_WITH_FIXES`

Esta auditoria **não implementa telas de produto**. Confirma fontes de verdade, gaps e o que pode começar agora.

---

## 1. Resumo executivo

O TERVELO está pronto para **foundation + UI a partir dos nodes publicados**. Código de produto ainda não começa nesta Phase 0.

| Superfície | Estado |
| --- | --- |
| Figma | **Um arquivo** (`uJxhUZVuIzCpFL94dtQj0G`) com **7 páginas-tópico** e ~80 frames (telas). O MCP lista só `01 — Foundations` até cada página ser carregada. Status: **`FIGMA_UI_PARTIAL`**. |
| GitHub | Repositório quase vazio (`README.md` em `main`). Branch desta auditoria: `cursor/phase-0-pre-implementation-audit-c3ef`. Sem CI, sem proteção. |
| Nhost | Projeto cloud citado. Sem migrations/metadata no repo. Sem evidência de GitHub link neste workspace. |
| Vercel | Ausente, conforme especificação. Não criar agora. |

A primeira inspeção MCP só viu `01 — Foundations` (páginas não carregadas ficam com `childCount: 0`). A reinspeção com o link completo (`node-id=2-3`) e `get_metadata` por page id inventariou o arquivo inteiro. Ver `docs/FIGMA_IMPLEMENTATION.md`.

---

## 2. Figma

### 2.1 Páginas

| Page ID | Nome | Conteúdo de produto |
| --- | --- | --- |
| `0:1` | `01 — Foundations` | Tokens, tipografia, grid, motion, ícones, Theme System |
| `2:2` | `02 — Components` | Kit v1.4.0: botões, campos, cards, toasts, overlays, nav. Symbols Button/Input/Card/Badge/NavItem |
| `2:3` | `03 — Athlete Desktop` | Landing `2:1865` + 7 telas Dark + 7 Light (1440) |
| `2:4` | `04 — Athlete Mobile` | Auth, onboarding, app, timer, anilhas, IA, estados especiais; Dark ~402×874 e variantes Light 390 |
| `2:5` | `05 — Admin` | Dashboard, usuários, IA, auditoria, exercícios, equipamentos, inventário (Dark + Light) |
| `2:6` | `06 — Prototype` | Mapa FL.01–FL.05 (`15:2307`) |
| `2:7` | `07 — Handoff` | Specs `15:2898`, Developer Reference `28:77`, **Code Tokens CSS `28:527`** |

### 2.2 Frames de primeiro nível (Foundations)

| Node | Nome | Tamanho |
| --- | --- | --- |
| `10:1253` | `foundations-tokens` | 1440 × 4656 |
| `15:3419` | `Theme System — Light & Dark` | 1440 × 2775 |

Inventário completo de telas: `docs/FIGMA_IMPLEMENTATION.md` §10.

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

- Symbols TERVELO: Button `28:20`, Input `28:23`, Card `28:27`, Badge `28:30`, NavItem `28:34`.
- Documentação: `10:1812` (botões, campos, controles, cards) e `10:2242` (toasts, overlays, bottom nav).
- Estados: default, hover, pressed, disabled, loading, focus, filled, error, empty de busca.
- Code Connect do arquivo ainda não está mapeado ao repo (repo sem componentes).
- Timer de produto **existe**: `10:758` cronometro-descanso (−15 / +15 / +30, Pausar, Reiniciar, Pular, Começar próxima série).

### 2.14 Telas e lacunas (`FIGMA_UI_PARTIAL`)

**Cobertas (mapa em FIGMA_IMPLEMENTATION.md):** `/`, `/login`, `/signup`, `/onboarding/*`, `/app/*` principais, execução, timer, nutrição, coach, evolução, corpo, calendário, perfil, admin (dashboard, users, IA, auditoria, exercícios, equipamentos, inventário). Light + Dark nos fluxos core.

**Ainda FIGMA_PENDING:**

- `/forgot-password` (só link no login)
- Academias do atleta
- Catálogo de equipamentos do atleta
- Settings do atleta (conta/tema/academia) — há perfil + `15:5780` configurações de IA
- Admin Treinamento, Nutrição, Configurações (itens de menu sem screen)
- Admin detalhe do atleta (só card no protótipo)
- Auth/onboarding/execução desktop
- Landing mobile
- Grid 360 px

Login Dark/Light inclui Google e Apple. Spec trata social como P3 — o Figma não muda isso para blocker.

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

Ver `docs/DECISIONS_REQUIRED.md` (D-001 a D-016). Não há conflito que impeça scaffold, tokens CSS, domínio ou banco.

Novos após reinspeção completa:

- Handoff `28:527` vs Foundations (nomes CSS, Display 32 vs 48, radius 6 vs 4, motion 200 vs 250, countdown 1s).
- Login social no Figma vs “não blocker”.
- Frames mobile 402 vs grid 390.
- Copy “FAQ” na landing.
- Snippet Zustand no handoff vs domínio desacoplado.

### 5.2 Acoplamento

Especificação exige: UI → application → domain/service → repository. GraphQL/Nhost ficam na borda. **Pode começar agora.**

### 5.3 Estrutura de pastas vs CLI Nhost

A árvore da especificação (`src/server`, `src/graphql`) é válida para o app Next.js. A CLI Nhost **exige** `nhost/` e `functions/` na raiz. Adaptar: domínio em `src/`, adapters Nhost em `nhost/` + `functions/`.

### 5.4 Multi-tenancy

Catálogo global vs dados do atleta. Ver D-010 e `DATABASE_DESIGN.md`.

### 5.5 Timer e offline

Tela de controles existe (`10:758` / Light `15:4065`). Lógica de timer (timestamps, não `setInterval` como fonte de verdade) **pode** ser domínio + testes. UI definitiva usa esses nodes via `get_design_context`.

---

## 6. Classificação

### P0 — blocker

Nenhum P0 para **Phase 1 Foundation**.

P0 para **UI de uma rota específica:** se o node não estiver na tabela de `FIGMA_IMPLEMENTATION.md`, a rota fica `FIGMA_PENDING` — não inventar.

### P1 — must fix (antes ou durante Phases 1–2)

| ID | Item |
| --- | --- |
| P1-01 | Resolver D-001/D-002/D-003/D-012/D-013/D-014 para gerar tokens sem adivinhar |
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
| P2-03 | Grid 360 (768 já está no handoff como `md`) |
| P2-04 | Publicar tela `/forgot-password` e settings/academias do atleta |
| P2-05 | Templates de e-mail Auth em PT-BR |
| P2-06 | Proteção de `main` no GitHub |
| P2-07 | Copy do showcase (“Projeto Alpha”) e “FAQ” na landing |
| P2-08 | Screens admin Treinamento / Nutrição / Configurações / detalhe do atleta |

### P3 — improvement

| ID | Item |
| --- | --- |
| P3-01 | Login social (já desenhado; não blocker) |
| P3-02 | PWA |
| P3-03 | Code Connect quando o plano Figma permitir |
| P3-04 | Vercel (somente Phase 12) |
| P3-05 | Landing e auth desktop |

---

## 7. O que pode começar vs o que espera Figma

### Pode começar

- Scaffold Next.js App Router, TS strict, ESLint, Prettier, Vitest, Playwright (smoke)
- CSS variables Light/Dark a partir do Handoff `28:527` (D-012 aberto)
- Manrope, Lucide, motion tokens
- Primitivos alinhados a `2:2` **depois** de `get_design_context` nos symbols
- Nhost CLI, Auth architecture, GraphQL codegen
- Schema, migrations, permissions
- Domain services: plate calculator, timer, periodização, validação
- Agents/skills/policies (contratos, sem UI)
- Cursor rules, testes unitários extensivos de anilhas
- CI

### UI definitiva só com node (`FIGMA_UI_PARTIAL`)

Implementar telas **somente** com o mapa de `FIGMA_IMPLEMENTATION.md` §10 e `get_design_context`.

### Ainda `FIGMA_PENDING` (não inventar)

`/forgot-password`, academias do atleta, catálogo de equipamentos do atleta, settings de conta, admin Treinamento/Nutrição/Configurações/detalhe do atleta, landing mobile, auth desktop.

Não inventar dashboards genéricos.

---

## 8. Veredito

```text
READY_WITH_FIXES
```

**Não BLOCKED:** foundation, domínio, banco, Nhost e UI das rotas já desenhadas podem avançar **depois** desta auditoria, quando a Phase 1 for autorizada.

**Não GO incondicional:** conflitos de token (D-001–D-004, D-012–D-014), Nhost não versionado, GitHub sem CI/`develop`, lacunas Figma pontuais.

**Fixes para sair de READY_WITH_FIXES rumo a GO de Phase 1:**

1. Aprovar mapeamento de tokens: Handoff `28:527` para CSS; Theme System para cor semântica residual; Foundations para ícones/motion de treino.
2. Criar scaffold e `nhost/` no repositório.
3. Operador informar subdomain/region e ligar GitHub no Nhost.

**Blockers de UI pontual (não de Phase 1):**

- Rotas da §2.14 sem node (`FIGMA_PENDING`).
