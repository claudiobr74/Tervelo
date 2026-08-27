# HARDENING — Auditoria pré-implementação

Inspeção: 2026-08-27. Complementa Phases 0–13 (auth, Hasura, treino, nutrição, IA, admin, FC, estado do atleta, offline). **Não substitui** esses módulos. **Não inclui** deploy Vercel (Phase 15).

Veredito: **READY_WITH_FIXES**. Sem P0. Prosseguir.

---

## Superfícies inspecionadas

| Superfície | Situação | Gap |
| --- | --- | --- |
| Cookie de sessão `POST /api/auth/session` | httpOnly, SameSite=lax, Secure em production | Aceita JSON arbitrário, inclusive `previewRole: admin` |
| Proxy (`src/proxy.ts`) | `/app` exige sessão; `/admin` exige papel admin | Sem headers de segurança; matcher não exclui SW/manifest |
| Hasura (`permission-matrix`) | Isolamento `X-Hasura-User-Id`; set_results/HR/check-ins append-only | `nutrition_checkins` ainda permite update (histórico mutável) |
| Logger (`src/lib/logger.ts`) | JSON em `console.info` | Sem redaction de PII (e-mail, tokens, FC, nutrição, cargas) |
| Health `/api/health` | `{ status, service }` | Sem versão; observabilidade mínima |
| Next config | `reactStrictMode` | `poweredByHeader` ligado; sem CSP / nosniff / frame |
| a11y | `lang="pt-BR"`; vários `aria-label`; sync com texto + ícone | Sem skip link, landmark de nav, `:focus-visible` global, `prefers-reduced-motion` |
| PWA / Bluetooth | SW + manifest públicos na prática; FC usa Web Bluetooth | Headers não devem bloquear `bluetooth` nem SW |
| CI | lint, typecheck, test, build | Sem e2e no CI (já era assim) |

---

## Prioridades

### P0

Nenhum. O app não está quebrado; o endurecimento fecha janelas reais.

### P1

- Recusar `preview` / `previewRole` no cookie em production; persistir só campos de sessão Nhost.
- Headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` / `frame-ancestors`, `Permissions-Policy` (câmera/mic/geo off; **bluetooth permitido** para FC).
- Logger com redaction (e-mail, tokens, FC bruta, nutrição, cargas).
- `nutrition_checkins` append-only: correção via `supersedes_id`, não update GraphQL (Hasura não consegue limitar “só o dia aberto”).
- Skip link “Ir para o conteúdo”, `main`/`nav` com nome acessível, `:focus-visible` e `prefers-reduced-motion`.

### P2

- Rate-limit em memória no `POST /api/auth/session`.
- Health com `version` (sem secrets).
- CSP compatível com Next/PWA/Nhost (`unsafe-inline` no script por causa do bootstrap de tema).
- `poweredByHeader: false`.
- Testes de proxy (atleta sem sessão → login; user sem admin → `/`).

### P3

- Rate-limit distribuído (não nesta fase).
- Relatório axe/CI automatizado em todas as rotas.
- Compressão/imagens: Next já comprime; sem rewrite de bundle.

---

## Fora de escopo

- Phase 15 (Vercel, domínio, env de produção).
- Redesign Figma; aumentar todos os hit-targets.
- Admin offline; IA fake offline.
- Secrets no git / `.env`.

---

## Decisão

Prosseguir HARD-1 … HARD-12 sem parar na auditoria.
