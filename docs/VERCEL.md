# Deploy Vercel

Preview: automático em PRs (GitHub App). **Production:** só `main` depois de aprovação humana — este repositório **não** dispara `vercel --prod`.

Auditoria: [`VERCEL_PRE_IMPLEMENTATION_AUDIT.md`](VERCEL_PRE_IMPLEMENTATION_AUDIT.md).

---

## O que já existe

- Projeto Vercel **tervelo** ligado ao GitHub `claudiobr74/Tervelo`.
- CI (`lint` / `typecheck` / `test` / `build`) no GitHub Actions.
- Headers de segurança no Next (CSP, nosniff, frame deny).
- PWA e cookie `Secure` quando `NODE_ENV=production` (Preview e Production na Vercel).

---

## Variáveis na Vercel

Settings → Environment Variables. **Production** e **Preview**.

| Nome                          | Público? | Valor                                       |
| ----------------------------- | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_NHOST_SUBDOMAIN` | sim      | subdomain do dashboard Nhost (não é secret) |
| `NEXT_PUBLIC_NHOST_REGION`    | sim      | region do dashboard (ex. `sa-east-1`)       |

**Não** criar `NEXT_PUBLIC_` para admin secret, JWT private key, chaves de modelo.

Sem essas duas, o Preview usa Nhost `local` (login de demonstração). Production **recusa** sessão `preview`. GIFs da biblioteca: no Preview eles só animam depois do upload ao bucket Nhost `exercise-media` — passo a passo em `scripts/gifdotreino-downloader/COMO_VER_OS_GIFS.md`. Opcional no servidor: `NHOST_ADMIN_SECRET` (nunca `NEXT_PUBLIC_`).

Copiar do dashboard Nhost: [projeto `wqttndghxeybdppcfnol`](https://app.nhost.io/orgs/bddfkiusstbzrfulumvl/projects/wqttndghxeybdppcfnol).

---

## URLs no Nhost (Auth → Redirections)

O app é o frontend. Colocar **URLs da Vercel/localhost** no Nhost, não o contrário.

| Campo                 | Valor                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Client URL            | `http://localhost:3000` até ter domínio de produção; depois a URL canônica `https://…`                 |
| Allowed redirect URLs | `http://localhost:3000` **e** a URL de Production (e Preview, se for usar e-mail de confirmação neles) |

Hasura no git usa `corsDomain = ['*']` de propósito: um secret `APP_URL` no TOML quebra o deploy Nhost se não existir no dashboard. GraphQL a partir da Vercel não depende de uma lista fechada; o JWT e as permissions Hasura autorizam.

---

## Proteção de deploy (SSO)

O Preview atual responde **302** para `vercel.com/sso-api`. Isso é a Authentication da Vercel.

| Ambiente   | Recomendação                                                                   |
| ---------- | ------------------------------------------------------------------------------ |
| Preview    | SSO ok para revisão interna. **Impede** smoke público e links de e-mail Nhost. |
| Production | **Sem** SSO Vercel. Atleta entra pelo login do Tervelo.                        |

Dashboard: Project → Settings → Deployment Protection.

Para abrir um Preview no browser: entre com a conta Vercel do time, ou desative SSO só no Preview.

---

## Smoke

Local (dev server):

```bash
npm run smoke:deploy -- http://localhost:3000
```

Contra um Preview **sem** SSO, ou Production pública:

```bash
npm run smoke:deploy -- https://SEU-DEPLOY.vercel.app
```

Esperado: `/api/health` → `{ status: "ok", service: "tervelo-web", version, deploy }` e `/login` 200.

Se o script sair com código 2, o deploy está atrás do SSO.

Playwright local: `e2e/deploy.spec.ts` (health, login, headers).

---

## Production (operador)

1. CI verde no PR.
2. Env Nhost preenchido em **Production**.
3. Client URL / allowed URLs no Nhost apontando para a URL de produção.
4. Deployment Protection: Production pública.
5. Merge em `main` **ou** Promote do Preview validado no dashboard Vercel.
6. Conferir `npm run smoke:deploy -- <url-produção>`.

Não commitar `.env`, `.vercel` nem secrets.
