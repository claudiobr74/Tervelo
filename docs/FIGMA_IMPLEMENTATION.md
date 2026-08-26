# TERVELO — Implementação Figma

**File:** [TERVELO — Design System + Product](https://www.figma.com/design/uJxhUZVuIzCpFL94dtQj0G/TERVELO-%E2%80%94-Design-System---Product?node-id=0-1)  
**File key:** `uJxhUZVuIzCpFL94dtQj0G`  
**Inspeção:** 2026-08-26 via Figma MCP (`get_metadata`, `get_design_context`, `get_screenshot`, `get_libraries`, `get_variable_defs`)

Gate: **não implementar tela funcional sem consultar o node correspondente**. Hoje, esses nodes **não existem**.

---

## 1. Status

```text
FIGMA_UI_PENDING
```

Única página: `01 — Foundations` (`0:1`).

Frames:

- `foundations-tokens` — `10:1253`
- `Theme System — Light & Dark` — `15:3419`

---

## 2. Precedência visual

1. Theme System para **tokens semânticos de cor** Light/Dark.
2. Foundations para **tipografia, espaço, grid, radius, elevation, ícones, motion**.
3. Conflitos de hex/nome → `docs/DECISIONS_REQUIRED.md` (D-001 a D-007).
4. Até aprovação: implementar o mapeamento proposto abaixo e não misturar os dois vocabulários no CSS.

---

## 3. Mapeamento proposto de CSS variables

Uma única superfície de tokens no código. Valores mudam com `[data-theme="light"|"dark"]`.

```css
:root {
  --color-background-primary: #0f1117;
  --color-background-secondary: #161920;
  --color-background-elevated: #1a1d27;
  --color-surface-primary: #1a1d27;
  --color-surface-secondary: #242833;
  --color-surface-interactive: #2a2e3b;
  --color-text-primary: #ffffff;
  --color-text-secondary: #9ca3af;
  --color-text-tertiary: #6b7280;
  --color-text-disabled: #4b5563;
  --color-border-default: #2a2e3b;
  --color-brand-primary: #f59e0b;
  --color-status-success: #10b981;
  --color-status-warning: #f59e0b;
  --color-status-error: #ef4444;
  --color-status-info: #3b82f6;
}
```

Light (`data-theme="light"`):

```css
--color-background-primary: #ffffff;
--color-background-secondary: #f8f9fa;
--color-background-elevated: #ffffff;
--color-surface-primary: #ffffff;
--color-surface-secondary: #f3f4f6;
--color-surface-interactive: #eef0f3;
--color-text-primary: #111827;
--color-text-secondary: #4b5563;
--color-text-tertiary: #6b7280;
--color-border-default: #e5e7eb;
--color-brand-primary: #d97706;
--color-status-success: #059669;
--color-status-warning: #d97706;
--color-status-error: #dc2626;
--color-status-info: #2563eb;
```

Aliases da spec (`--color-background`, `--color-surface`, `--color-surface-elevated`, `--color-border`, `--color-text-primary`, `--color-text-secondary`, `--color-brand-primary`) apontam para os tokens acima.

**Não** espalhar hex nos componentes.

Dark default no treino; persistir `light` | `dark` | `system`.

---

## 4. Tipografia

**Manrope** via `next/font`. Pesos: Regular 400, Medium 500, SemiBold 600, Bold 700.

| Token | Size | Weight | Line-height |
| --- | --- | --- | --- |
| `--font-display` | 48px | 700 | 1.2 |
| `--font-h1` | 32px | 700 | 1.3 |
| `--font-h2` | 24px | 600 | 1.3 |
| `--font-h3` | 20px | 600 | 1.4 |
| `--font-body-lg` | 16px | 400 | 1.5 |
| `--font-body` | 14px | 400 | 1.5 |
| `--font-body-sm` | 12px | 400 | 1.4 |
| `--font-label` | 14px | 500 | 1.2 |
| `--font-caption` | 11px | 400 | 1.2 |

Não usar Inter. Geist Mono só se uma tela de produto o exigir (hoje só no DS).

---

## 5. Espaço, raio, sombra, motion

Espaço: 2–80 px (`--space-1` … `--space-12`).

Radius: 4 badges, 8 buttons/inputs, 12 cards, 16 modals, 24 pills, full avatars.

Elevation Dark: superfícies, não sombra pesada. Light:  
- 0 none  
- 1 `y:2 blur:4 / 15%`  
- 2 `y:4 blur:12 / 20%`  
- 3 `y:12 blur:32 / 40%`

Motion:

| Token | Valor |
| --- | --- |
| `--motion-micro` | 150ms ease-out |
| `--motion-transition` | 250ms ease-in-out |
| `--motion-spring` | 300ms spring |
| `--motion-countdown` | 1s linear |
| `--motion-number` | 400ms ease-out |

---

## 6. Grid e breakpoints

| Nome | Largura | Colunas | Margem | Gutter |
| --- | --- | --- | --- | --- |
| Mobile (Figma) | 390 | 4 | 16 | 16 |
| Desktop (Figma) | 1440 | 12 | 80 | 24 |

Validar também 360 e 768 **sem inventar um grid Figma**. Atleta: mobile-first. Admin: desktop-first quando o Figma existir.

---

## 7. Ícones

`lucide-react`, 24px, `strokeWidth={1.5}`. Sem emoji-ícone.

---

## 8. Acessibilidade de linguagem

- UI e IA em PT-BR.
- Sem siglas soltas. Forma: **Repetições em reserva (RIR)** + explicação.
- Tooltip/popover: mouse, toque, teclado, leitor de tela.
- Alvos de toque ≥ 44px quando o Figma não especificar menor (WCAG).
- Contraste: seguir tabela do Theme System; caption 11px no Dark com Text/Secondary (4.6:1) é limite — preferir Text/Primary em texto pequeno.

---

## 9. Showcase vs produto

O Theme System mostra botões, input, card e timer `02:45`. São **referências de token**, não biblioteca de componentes.

Copy “Projeto Alpha / dados fiscais” **não** entra no produto (D-005).

Controles de timer da spec (+15, +30, −15, pausar, reiniciar, pular) **não estão no Figma**. Domínio pode existir; UI definitiva = `FIGMA_PENDING`.

---

## 10. Protocolo por tela futura

1. Procurar a tela e o `node-id` no arquivo.
2. Carregar skill `figma-design-to-code`.
3. `get_design_context` no node.
4. Reusar tokens e primitivos do código.
5. Light e Dark. Mobile 390 e Desktop 1440.
6. Se o node não existir: backend + `FIGMA_PENDING`. Não gerar dashboard genérico.

---

## 11. O que o código pode fazer agora

- Folha de tokens
- Theme provider
- Página interna `/dev/tokens` (não linkada como produto)
- Primitivos sem visual de biblioteca: `Button` só depois de componente Figma **ou** com mapeamento explícito do showcase + tokens (ainda assim, não montar telas de app)

## 12. O que não fazer

- Inventar login/onboarding/treino
- Usar Material 3 / SDS / UIKit como visual
- Duplicar componentes Light e Dark
- Tratar Foundations Light “Em preparação” como paleta final (Theme System prevalece)
