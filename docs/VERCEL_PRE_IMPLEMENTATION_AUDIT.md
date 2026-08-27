# VERCEL — Auditoria pré-implementação

Inspeção: 2026-08-27. Complementa Phases 0–14. **Não** promove production sem aprovação humana.

Veredito: **READY_WITH_FIXES**. Sem P0 de código. Há ações de operador no dashboard.

---

## Superfícies inspecionadas

| Superfície | Situação | Gap |
| --- | --- | --- |
| GitHub → Vercel | Preview automático nos PRs (ex. Phase 14 Ready) | Production em `main` só após aprovação humana |
| `vercel.json` | ausente | Next.js é detectado; declarar framework + `npm ci` |
| Env Vercel | este agente **não** acessa o projeto Tervelo no MCP | Operador: `NEXT_PUBLIC_NHOST_SUBDOMAIN` / `REGION` |
| Cookie / preview session | `allowPreview` usa `NODE_ENV !== production` | Na Vercel `NODE_ENV=production` também no Preview → login fake quebra |
| Protection | Preview responde **302 SSO** (`vercel.com/sso-api`) | Bloqueia smoke público e links de e-mail Nhost no preview |
| Health | `{ status, service, version }` | Sem `deploy` (local / preview / production) |
| Nhost `clientUrl` | `http://localhost:3000` | Operador adiciona URL estável no console Nhost |
| Domínio custom | Phase 15 não compra domínio | Documentar; produção pode usar `*.vercel.app` até haver domínio |

---

## Prioridades

### P0

Nenhum no repositório. O Git já dispara preview.

### P1

- Distinguir Preview vs Production (`VERCEL_ENV`): preview local só no Preview **sem** Nhost cloud; Production **nunca** aceita `previewRole`.
- Documentar env públicos na Vercel e redirects no Nhost.
- Health com alvo de deploy (sem secrets).
- Smoke script que detecta SSO vs app saudável.

### P2

- `vercel.json` com framework Next.js e `npm ci`.
- Checklist de proteção: Preview pode ficar com SSO; **Production** precisa ser pública para atletas (auth do app, não SSO Vercel).
- Node 22 (já no `package.json` / CI).

### P3

- Domínio custom.
- Abrir proteção do Preview se quiser testar e-mail Nhost nessa URL.

---

## Fora de escopo

- `vercel --prod` / promover `main` sem aprovação humana.
- Comprar domínio.
- Preencher o console Nhost (sem credencial neste ambiente).
- Admin secret / chaves de IA no cliente.

---

## Decisão

Prosseguir VER-1 … VER-8 sem parar na auditoria. Production continua bloqueada até o operador aprovar.
