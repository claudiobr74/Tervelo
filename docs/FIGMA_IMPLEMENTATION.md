# TERVELO — Implementação Figma

**File:** [TERVELO — Design System + Product](https://www.figma.com/design/uJxhUZVuIzCpFL94dtQj0G/TERVELO-%E2%80%94-Design-System---Product?node-id=2-3)  
**File key:** `uJxhUZVuIzCpFL94dtQj0G`  
**Inspeção completa:** 2026-08-26 via Figma MCP (`use_figma` em `figma.root.children`, depois `get_metadata` / `setCurrentPageAsync` por página)  
**Contagem:** 7 páginas-tópico, ~80 frames de primeiro nível (telas, kits e canvases).

### Como acessar o arquivo inteiro (não só Foundations)

O MCP `get_metadata` **sem** `nodeId` devolve só a página atual — em geral `0:1` `01 — Foundations`. As outras páginas existem no documento, mas vêm com `childCount: 0` até serem carregadas.

Protocolo obrigatório neste file:

1. `use_figma`: `return figma.root.children.map(p => ({ id: p.id, name: p.name }))` — lista as 7 páginas.
2. Uma chamada por página: `await figma.setCurrentPageAsync(page)` **ou** `get_metadata` com o page id (`2:2` … `2:7`).
3. **Não** usar `loadAllPagesAsync` (não suportado neste MCP).
4. Um `setCurrentPageAsync` por chamada `use_figma`; várias páginas = várias chamadas em paralelo.

Este MCP enxerga **um file** por `fileKey`. Se o time Macedotech tiver **outros arquivos** no mesmo Project do Figma (outros `.fig` / outras URLs `/design/...`), eles **não** aparecem aqui. Enviar o link de cada arquivo ou o link do Project.

Gate: **não implementar tela funcional sem `get_design_context` no node correspondente** (skill `resource:figma-design-to-code`). O output é referência, não código final.

---

## 1. Status

```text
FIGMA_UI_PARTIAL
```

O arquivo **não** é só Foundations. Há Design System, componentes, fluxos de atleta (mobile + desktop), admin, protótipo e handoff com CSS copy-paste.

Ainda faltam telas pontuais (ver §11). Isso **não** autoriza inventar UI genérica para as rotas cobertas.

---

## 2. Páginas

| Page ID | Nome | Papel |
| --- | --- | --- |
| `0:1` | 01 — Foundations | Tokens visuais, tipografia, grid, motion, ícones |
| `2:2` | 02 — Components | Kit v1.4.0: botões, campos, controles, cards, toasts, overlays, nav |
| `2:3` | 03 — Athlete Desktop | Landing + app desktop 1440 (Dark e Light) |
| `2:4` | 04 — Athlete Mobile | App atleta ~402×874 (conteúdo 390), Dark e Light |
| `2:5` | 05 — Admin | Console desktop 1440 (Dark e Light) |
| `2:6` | 06 — Prototype | Mapa de fluxos FL.01–FL.05 (`15:2307`) |
| `2:7` | 07 — Handoff | Specs + referência Cursor/React + **Code Tokens CSS** |

Kit de componentes: v1.4.0. Handoff Developer Reference: v1.2.0-beta. Specs: v1.0, “READY FOR DEV”, atualizado 24 de outubro de 2026.

---

## 3. Precedência visual (código)

1. **Handoff `28:527` (Code Tokens — CSS & Tailwind)** — nomes e valores copy-paste para `globals.css` / Tailwind.
2. **Theme System `15:3419`** — cores semânticas Light/Dark quando o handoff não cobrir um token.
3. **Foundations `10:1253`** — ícones Lucide 24px stroke 1.5, escala de espaço 2–80, Display 48px de marketing, motion de countdown/números.
4. **Página Components `2:2`** — estados de primitivos (hover, pressed, disabled, loading, error, empty).
5. **Telas de produto** — layout, copy e densidade. Sempre via `get_design_context` no frame da rota.

Conflitos de hex/nome/métrica → `docs/DECISIONS_REQUIRED.md` (D-001 a D-016). Não misturar vocabulários no CSS (`--color-*` da auditoria inicial vs `--bg-*` do handoff).

---

## 4. Tokens CSS — fonte `28:527`

Proposta de implementação (pendente D-012): copiar estes nomes. Valores mudam com classe `.dark` (handoff) **e** persistência `light | dark | system`. Dark default no treino.

Light (`:root`):

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-elevated: #ffffff;
  --surface-primary: #ffffff;
  --surface-secondary: #f3f4f6;
  --surface-interactive: #eef0f3;
  --surface-hover: #e5e7eb;
  --surface-pressed: #d1d5db;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-tertiary: #6b7280;
  --text-disabled: #9ca3af;
  --text-inverse: #ffffff;
  --border-default: #e5e7eb;
  --border-strong: #9ca3af;
  --border-subtle: #f3f4f6;
  --brand-primary: #d97706;
  --brand-secondary: #92400e;
  --brand-accent: #b45309;
  --status-success: #059669;
  --status-warning: #d97706;
  --status-error: #dc2626;
  --status-info: #2563eb;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  --space-4xl: 40px;
  --space-5xl: 48px;
  --space-6xl: 64px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  --font-family: "Manrope", sans-serif;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.12);
  --transition-fast: 150ms ease-out;
  --transition-default: 200ms ease-out;
  --transition-slow: 300ms ease-in-out;
}
```

Dark (`.dark`):

```css
.dark {
  --bg-primary: #0f1117;
  --bg-secondary: #161920;
  --bg-elevated: #1a1d27;
  --surface-primary: #1a1d27;
  --surface-secondary: #242833;
  --surface-interactive: #2a2e3b;
  --surface-hover: #323744;
  --surface-pressed: #3d4252;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
  --text-tertiary: #6b7280;
  --text-disabled: #4b5563;
  --text-inverse: #111827;
  --border-default: #2a2e3b;
  --border-strong: #4b5563;
  --border-subtle: #1f2330;
  --brand-primary: #f59e0b;
  --brand-secondary: #fcd34d;
  --brand-accent: #f59e0b;
  --status-success: #10b981;
  --status-warning: #f59e0b;
  --status-error: #ef4444;
  --status-info: #3b82f6;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
}
```

**Não** espalhar hex nos componentes.

Handoff sugere Zustand persist `tervelo-theme`. O produto **pode** persistir o tema; o domínio **não** deve acoplar a Zustand (D-015). Preferir `data-theme` + cookie/localStorage via provider do app.

Aliases da spec funcional (`--color-background`, `--color-surface`, `--color-brand-primary`) apontam para os tokens acima, não para um segundo vocabulário.

---

## 5. Tipografia

Fonte de produto: **Manrope** via `next/font`. Pesos: Regular 400, Medium 500, SemiBold 600, Bold 700. Não usar Inter.

Handoff `15:2898` / `28:527` (UI de produto — D-013):

| Token | Size / line / weight |
| --- | --- |
| Display | 32px / 40 / 700 |
| H1 | 24px / 32 / 700 |
| H2 | 20px / 28 / 600 |
| H3 | 16px / 24 / 600 |
| Body | 14px / 20 / 400 |
| Caption | 12px / 16 / 400 |
| Overline | 10px / 14 / 500 uppercase |

Foundations `10:1253` (marketing / Display hero — D-013):

| Token | Size / weight / LH |
| --- | --- |
| Display | 48px / 700 / 1.2 |
| Heading 1 | 32px / 700 / 1.3 |
| Heading 2 | 24px / 600 / 1.3 |
| Heading 3 | 20px / 600 / 1.4 |
| Body Large | 16px / 400 / 1.5 |
| Body | 14px / 400 / 1.5 |
| Body Small | 12px / 400 / 1.4 |
| Label | 14px / 500 / 1.2 |
| Caption | 11px / 400 / 1.2 |

Proposta: escala do **handoff** na app; Display 48px só na landing (`2:1865`) e no DS. Caption 11px de Foundations só se o `get_design_context` da tela pedir.

Geist Mono: só no DS (hex codes). Ver D-006.

---

## 6. Espaço, raio, sombra, motion

**Espaço Foundations:** 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px (`TERVELO-Space-1` … `12`).  
**Espaço Handoff:** começa em 4px (`--space-xs`); não mapeia 2px nem 80px. Padrões de componente: card 20px, botão 12×24, input 12×16, gap de seção 24px.

**Radius Foundations:** 4 badges, 8 buttons/inputs, 12 cards, 16 modals, 24 pills, full avatars.  
**Radius Handoff:** `--radius-sm: 6px` (não 4px). Ver D-014.

**Elevation:** Dark = superfícies, não sombra pesada. Light = sombras do handoff (`--shadow-sm/md/lg`). Foundations Light: 0 / y:2 blur:4 15% / y:4 blur:12 20% / y:12 blur:32 40%.

**Motion Foundations** (domínio de treino):

| Token | Valor |
| --- | --- |
| `--motion-micro` | 150ms ease-out |
| `--motion-transition` | 250ms ease-in-out |
| `--motion-spring` | 300ms spring |
| `--motion-countdown` | 1s linear |
| `--motion-number` | 400ms ease-out |

**Motion Handoff:** 150 / 200 / 300 ms. Proposta: CSS usa handoff; countdown 1s e número 400ms ficam como tokens extras do domínio de treino (D-014).

---

## 7. Grid e breakpoints

Artboards Figma:

| Nome | Largura | Colunas | Margem | Gutter |
| --- | --- | --- | --- | --- |
| Mobile (Foundations + Handoff) | 390 | 4 | 16 | 16 |
| Desktop | 1440 | 12 | 80 | 24 |

Frames Dark de atleta mobile têm **402×874** (chrome de device); conteúdo útil **390**. Ver D-016.

Breakpoints Tailwind no Developer Reference (`28:77`):

| Token | Valor | Alvo |
| --- | --- | --- |
| sm | 640px | Mobile landscape / tablets pequenos |
| md | 768px | Tablets verticais |
| lg | 1024px | Tablets horizontais / netbooks |
| xl | 1280px | Laptops |
| 2xl | 1440px | Desktop Figma |

Validar 360 px **sem inventar grid Figma**. Atleta: mobile-first. Admin: desktop-first.

---

## 8. Ícones

`lucide-react`, 24px, `strokeWidth={1.5}` na spec de Foundations. Telas usam também 18px / 20px / 16px em chrome (sidebar, status). Sem emoji-ícone.

Inventário Foundations: home, calendar, trending-up, brain, menu, dumbbell, clock, play-circle, heart-pulse, target, award, shield, trending-down, scale, ruler, sparkles, cpu, bot, plus, minus, check, edit, share, settings, sun, moon, monitor.

---

## 9. Componentes (`2:2`)

Frames de documentação:

- `10:1812` Buttons, Inputs, Cards — seções botões, campos, controles, cards de exercício, cards/dashboards
- `10:2242` Feedback, Overlays, Navigation — toasts, banners, overlays, bottom nav

Symbols:

| Node | Nome |
| --- | --- |
| `28:20` | Button (Primary/Secondary/Ghost/Danger, md, Default/Hover/Disabled) |
| `28:23` | Input |
| `28:27` | Card |
| `28:30` | Badge |
| `28:34` | NavItem |

Estados já desenhados: hover, pressed, disabled, loading, focus, filled, error, empty (“Nenhum resultado encontrado”).

Não usar Material 3 / SDS / UIKit anexados (D-007).

---

## 10. Mapa rota → node

Nodes **Dark** são a referência principal do treino. Nodes Light são variantes obrigatórias do mesmo fluxo, não telas novas.

### 10.1 Marketing e auth

| Rota | Node Dark | Node Light | Notas |
| --- | --- | --- | --- |
| `/` | `2:1865` landing-page (1440×7856) | — | Nav usa sigla **FAQ** (D-005 / copy). Sem landing mobile. |
| `/login` | `2:1428` | `15:7801` (em `15:7800`) | Link “Esqueci minha senha”; Google/Apple. Sem tela `/forgot-password`. |
| `/signup` | `2:1478` | `15:7843` | |
| `/forgot-password` | — | — | **FIGMA_PENDING**. Só o link no login. |
| `/onboarding/perfil` | `2:1526` | `15:5638` | |
| `/onboarding/medidas` | `2:1578` | `15:7892` | |
| `/onboarding/experiencia` | `2:1642` | `15:7940` | |
| `/onboarding/objetivos` | `2:1696` | `15:7996` | |
| `/onboarding/nutricao` | `2:1765` | `15:8052` | |

Auth/onboarding **desktop** não tem frames dedicados. Adaptar a partir do mobile + tokens, sem inventar layout de marketing.

### 10.2 Atleta — mobile (`2:4`)

| Rota / superfície | Node Dark | Node Light |
| --- | --- | --- |
| `/app/today` | `2:15` dashboard-hoje | `15:3832` (em `15:3831`) |
| `/app/plan` | `2:108` plano-treinamento | `15:8114` |
| `/app/workout` | `2:188` treino-do-dia | `15:3908` |
| `/app/workout/exercise` | `2:372` execucao-exercicio | `15:3980` |
| `/app/workout/rest` | `10:758` cronometro-descanso | `15:4065` |
| `/app/workout/summary` | `2:428` resumo-treino | `15:4093` |
| `/app/recovery` | `2:499` checkin-recuperacao | `15:4144` |
| `/app/nutrition` | `2:817` nutricao | `15:4343` |
| `/app/coach` | `2:944` coach-ia | `15:4465` |
| `/app/progress` | `2:1025` evolucao | `15:4534` |
| `/app/body` | `2:1122` corpo-medidas | `15:4643` |
| `/app/calendar` | `2:1218` calendario | `15:4758` |
| `/app/profile` | `2:1334` perfil | `15:4876` |
| Timer: −15 / +15 / +30, Pausar, Reiniciar, Pular | `10:758` | `15:4065` |
| Calculadora de anilhas | `10:835` | `15:5325` |
| Substituição de equipamento | `10:923` | `15:5432` |
| Busca de exercícios | `10:1016` | `15:5213` |
| Exercício unilateral | `10:1118` | `15:5539` |
| Supersérie | `10:2584` | `15:8388` (screen-1) |
| Alteração IA | `10:2651` | `15:8472` (screen-2) |
| Command palette | `10:2699` | `15:8546` (screen-3) |
| Aquecimento | `10:2757` | `15:8596` (screen-4) |
| Notificações | `15:968` | `15:8665` (screen-5) |
| FAB expandido | `15:1055` | `15:8743` (screen-6) |
| Drop-set | `15:1109` | `15:8783` (screen-7) |
| Histórico do exercício | `15:1181` | `15:8857` (screen-8) |
| Configurações de IA | — | `15:5780` |
| Admin compacto (referência, não produto atleta) | — | `15:5699` |

Canvas Light agrupados: `15:3831` core flow, `15:7800` auth/onboarding, `15:8387` special states.

### 10.3 Atleta — desktop (`2:3`)

| Rota | Node Dark | Node Light |
| --- | --- | --- |
| `/app/today` | `15:11` dashboard-desktop | `15:6095` |
| `/app/workout` | `15:570` treino-desktop | `15:6250` |
| `/app/progress` | `15:216` evolucao-desktop | `15:6374` |
| `/app/coach` | `15:418` coach-desktop | `15:9176` |
| `/app/nutrition` | `15:1436` nutricao-desktop | `15:9290` |
| `/app/body` | `15:1706` corpo-medidas-desktop | `15:9483` |
| `/app/calendar` | `15:1894` calendario-desktop | `15:9622` |

Sidebar desktop cita **Configurações**; não há frame dedicado de settings do atleta (usar `perfil` + `15:5780` até o design publicar). Sem desktop de execução de série / timer / onboarding.

### 10.4 Admin (`2:5`)

| Rota | Node Dark | Node Light |
| --- | --- | --- |
| `/admin` | `2:2503` Screen-1-Dashboard | `15:6624` |
| `/admin/users` | `2:2659` Screen-2-Gestao-Usuarios | `15:6757` |
| `/admin/ai` | `2:2954` Screen-3-Inteligencia-Artificial | `15:6902` |
| `/admin/audit` | `2:3112` Screen-4-Auditoria | `15:7015` |
| `/admin/exercises` | `10:7` Screen-1-Biblioteca-Exercicios | `15:7136` |
| `/admin/equipment` | `10:201` Screen-2-Biblioteca-Equipamentos | `15:7244` |
| `/admin/inventory` | `10:377` Screen-3-Inventario-Academia | `15:7366` |

Menu Dark também lista **Treinamento**, **Nutrição**, **Configurações** — **sem screens dedicadas**. Protótipo FL.05 cita **Detalhe do atleta** — sem frame. **FIGMA_PENDING**.

Canvases: `2:2502` (4 telas Dark), `10:6` (bibliotecas/inventário Dark), `15:6623` e `15:7135` (Light).

### 10.5 Handoff (`2:7`) — não são rotas

| Node | Uso |
| --- | --- |
| `15:2898` | Specs (cores Dark resumidas, tipo 32px, SEC-01…05, API summary) |
| `28:77` | Developer Reference Cursor/React (spacing Tailwind, grid, breakpoints) |
| `28:527` | CSS + `tailwind.config.ts` copy-paste + exemplo de theme store |

---

## 11. Ainda `FIGMA_PENDING`

| Superfície | Situação |
| --- | --- |
| `/forgot-password` | Só link no login |
| Academias do atleta | Sem tela |
| Catálogo de equipamentos do atleta | Há busca de exercícios e substituição; sem catálogo próprio |
| Settings do atleta (conta, tema, academia) | Perfil + `light-configuracoes-ia`; sidebar desktop “Configurações” sem frame |
| Treino e dispositivos / frequência cardíaca | Sem frame; bloco em `/app/settings` no Design System até o Figma publicar |
| Check-in Pré-Treino / Check-out Pós-Treino / Estado do Atleta / Revisão Semanal do Coach | Sem frames; UI mínima Phase 12 com flag **FIGMA_UI_PENDING** |
| Admin Treinamento / Nutrição / Configurações | Itens de menu sem screen |
| Admin detalhe do atleta | Só card no protótipo FL.05 |
| Auth/onboarding/execução desktop | Sem frames |
| Landing mobile | Sem frame |
| Grid 360 px | Ausente (768 existe como breakpoint `md`) |
| Empty/error de produto além do kit | Kit tem empty de busca; não há empty de treino/plano |

Copy: landing usa “FAQ”. Theme System ainda mostra “Projeto Alpha / dados fiscais” (D-005). Login social no Figma **não** torna social um blocker de MVP (spec: P3).

---

## 12. Protocolo por tela

1. Localizar o `node-id` nesta tabela (Dark + Light).
2. Carregar skill `figma-design-to-code` (`skill://figma/figma-design-to-code/SKILL.md`).
3. `get_design_context` no **frame da tela**, não na página inteira. `skillNames`: `resource:figma-design-to-code`.
4. Reusar tokens de `28:527` e primitivos de `2:2`.
5. Implementar Light e Dark. Mobile 390 e Desktop 1440 quando ambos existirem.
6. Se o node não existir: backend + flag `FIGMA_PENDING`. **Não** gerar dashboard genérico.

---

## 13. O que o código pode fazer agora (Phase 1+)

- Folha de tokens a partir de `28:527`
- Theme provider (`light` / `dark` / `system`), persistência sem Zustand no domínio
- Página interna `/dev/tokens` (não linkada como produto)
- Primitivos alinhados a `2:2` (Button, Input, Card, Badge, NavItem) **depois** de `get_design_context` nos symbols
- Telas de produto **somente** com o node da §10

## 14. O que não fazer

- Inventar rotas da §11
- Usar Material 3 / SDS / UIKit como visual
- Duplicar componentes Light e Dark
- Tratar Foundations Light “Em preparação” como paleta final
- Copiar o snippet Zustand do Figma para o domínio
- Implementar a landing copiando o showcase “Projeto Alpha”
