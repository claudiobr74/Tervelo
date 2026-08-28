# TERVELO — Arquitetura Nhost

Backend oficial: **Nhost** (PostgreSQL + Hasura + Auth + Storage + Functions).  
**Não** usar Supabase nem Firebase.

Project reference: `wqttndghxeybdppcfnol`  
Org: `bddfkiusstbzrfulumvl`

Este workspace **não autenticou** o console Nhost. Subdomain/region devem ser preenchidos em `.env.example` pelo operador (D-009).

---

## 1. Papel de cada produto Nhost

| Produto                           | Uso no TERVELO                                                  |
| --------------------------------- | --------------------------------------------------------------- |
| PostgreSQL                        | Fonte de verdade longitudinal                                   |
| Hasura GraphQL                    | CRUD estruturado, permissions, relationships                    |
| Auth                              | Cadastro, sessão, JWT, roles, e-mail                            |
| Storage                           | Avatares, mídia de exercício/equipamento, progresso, documentos |
| Functions                         | IA, rate limit, webhooks, jobs que precisam de secrets          |
| Hasura Events (quando necessário) | side-effects (notificações), não regra de treino                |

Lógica de negócio **não** vive em componentes React nem em resolvers Hasura ad hoc. Hasura persiste e autoriza; `src/domain` decide; Functions orquestram IA.

---

## 2. Layout no repositório (CLI oficial)

A spec pede `nhost/migrations|metadata|seeds`. A CLI atual também usa `nhost.toml` e `functions/` na **raiz**:

```text
nhost/
  nhost.toml
  emails/                 # templates Auth PT-BR
  metadata/               # tables, permissions, relationships
  migrations/default/
  seeds/
functions/                # HTTP: AI orchestrator, webhooks
  ai/
src/                      # Next.js — domínio, UI, graphql documents
```

Não duplicar schema só no dashboard. Toda alteração de tabela/permission entra no git.

Fluxo local: `nhost init` → `nhost up` → mudar via dashboard local **ou** SQL versionado → commit → push → deploy Nhost (quando o GitHub estiver ligado).

---

## 3. Auth

### 3.1 Métodos MVP

- E-mail + senha
- Confirmação de e-mail
- Recuperação de senha
- Sessão persistente + refresh (`@nhost/nhost-js`, cookies no App Router)

Social: entradas em `nhost.toml` **desabilitadas** até não serem blocker.

### 3.2 Roles iniciais

| Role          | Default     | Uso                            |
| ------------- | ----------- | ------------------------------ |
| `public`      | anônimo     | zero dados de atleta           |
| `user`        | autenticado | próprio atleta                 |
| `admin`       | allowed     | catálogo, suporte operacional  |
| `super_admin` | allowed     | contratos IA, auditoria, roles |

Preparar nomes futuros **sem** permissions amplas agora: `coach`, `nutritionist`, `support`, `content_manager`.

Configurar em `auth.user.roles` no `nhost.toml` (`default` = `user`, `allowed` inclui admin roles). Atribuição de admin **somente** via `auth.user_roles` no banco (operador), nunca pelo cliente.

### 3.3 Claims

Built-in: `x-hasura-user-id`, `x-hasura-default-role`, `x-hasura-allowed-roles`.

Custom claims na Phase 2: nenhum obrigatório (atleta = user id).  
Futuro org:

```toml
[[auth.session.accessToken.customClaims]]
key = "organization-id"
value = "profile.organization.id"
default = "00000000-0000-0000-0000-000000000000"
```

Não usar claim para “autorizar admin” se a role JWT já o faz.

### 3.4 Cliente Next.js

- Browser: `createClient({ subdomain, region })` com env **públicos** (`NEXT_PUBLIC_NHOST_SUBDOMAIN`, `NEXT_PUBLIC_NHOST_REGION`).
- Server Components / middleware: `createServerClient` + cookie storage (padrão oficial Nhost App Router).
- **Nunca** `adminSecret` / `NHOST_ADMIN_SECRET` / chaves de IA no bundle.
- GraphQL do browser com JWT do usuário. Operações privilegiadas só em Functions.

Locale Auth: `pt` default.

Redirects de e-mail: URL do app (local / Vercel) em `auth.clientUrl` / allowed redirect URLs. Checklist: [`VERCEL.md`](VERCEL.md).

---

## 4. GraphQL

- Endpoint Hasura via SDK `nhost.graphql`.
- Documents em `src/graphql/<domínio>/*.graphql`.
- Codegen (`@graphql-codegen/cli`) contra schema local com admin secret **só em máquina de dev/CI**, nunca commitado.
- Proibido: strings GraphQL soltas em componentes.

Hasura **não** substitui o domain layer. Repositórios traduzem operations → tipos de domínio.

### 4.1 Permissions — padrão

Para tabelas com `user_id`:

- `select` / `update` / `delete`: `_eq: X-Hasura-User-Id`
- `insert`: `check` igual + `set.user_id = X-Hasura-User-Id`; colunas mínimas
- Exceção: `gym_memberships` — o dono da academia insere `user_id` de outros atletas (sem preset de sessão)
- Catálogo: `select` para `user`; `insert/update/delete` para `admin` / `super_admin`

`set_results`: `update` de métricas **negado** para `user`.  
`ai_contract_versions`: `user` select só `published` (ou via Function que monta o contrato ativo). Usuário não publica contrato.

Testes de permission (integration) são DoD da Phase 2.

### 4.2 Row vs column

Ocultar colunas internas (`client_mutation_id` pode ser insert-only). Admins não recebem carte blanche em PII — `super_admin` para audit_logs.

---

## 5. Storage

Buckets (migration `INSERT INTO storage.buckets`):

| Bucket            | Conteúdo          | Presign    | Visibilidade                                    |
| ----------------- | ----------------- | ---------- | ----------------------------------------------- |
| `avatars`         | foto de perfil    | sim, curta | dono write; read dono (público opcional depois) |
| `exercise-media`  | catálogo          | sim        | read autenticado; write admin                   |
| `equipment-media` | catálogo          | sim        | idem                                            |
| `progress-media`  | fotos de evolução | sim, curta | só dono                                         |
| `documents`       | laudos etc.       | sim, curta | só dono                                         |

Permissions em `storage.files` (`uploaded_by_user_id` / `bucket_id`).  
**Não** servir mídia privada por URL permanente pública.

---

## 6. Functions (workloads de servidor)

```text
functions/ai/orchestrate.ts    # JWT + 501 not_implemented (Phase 9)
```

Uso previsto: chamar modelos, montar contexto do banco com admin client **no servidor**, aplicar policies, gravar `ai_runs` / `ai_decisions`, rate limit por `user_id`. Hoje o handler só autentica e recusa. `functions/ai/audit.ts` ainda não existe.

Env injetado pelo Nhost (`NHOST_ADMIN_SECRET`, etc.) + secret de provedor de modelo no dashboard (não no git).

Express handler padrão Nhost. Validar JWT. Não confiar em IDs do body sem checar o user do token.

Rate limit: token bucket em tabela `ai_rate_limits` ou equivalente na Function (Phase 9). Phase 2 reserva a tabela se barato; senão Phase 9.

---

## 7. `nhost.toml` — recortes previstos

- `auth.user.locale.default = "pt"`
- `auth.user.roles.default = "user"`
- `auth.user.roles.allowed = ["user", "me", "admin", "super_admin"]` (`me` é o papel interno do Auth Nhost)
- Email verification enabled
- SMTP via `provider.smtp` (secrets no cloud, não no repo)
- Hasura allowed roles alinhados

Arquivo versionado. Secrets em `./.secrets` local (gitignored) e dashboard cloud. Todo `{{ secrets.X }}` no TOML precisa existir no Cloud — um nome ausente aborta o deploy com _invalid configuration_ (foi o caso de `APP_URL` no CORS do Hasura). JWT RS256: gerar com `npm run nhost:jwt` e colar o PEM completo no dashboard; chave privada placeholder faz o Auth sair com `exit 1` (Hasura pode continuar verde).

---

## 8. Integração GitHub

Deploy Nhost = push no repo ligado.  
**Ação do operador:** conectar `claudiobr74/Tervelo` ao projeto `wqttndghxeybdppcfnol`.

Até lá: desenvolvimento local com `nhost up`.

Não exigir Vercel nesta etapa (Phase 2). O deploy está na Phase 15 (`docs/VERCEL.md`).

---

## 9. Camadas (anti-acoplamento)

```text
UI (App Router)
  → application (use-cases)
    → domain (regras puras)
      → ports (interfaces)
        → adapters/nhost (GraphQL, Storage)
        → adapters/functions (fetch para Functions)
```

Trocar Hasura no futuro não deve reescrever periodização, anilhas ou timer.

---

## 10. Segurança

- Validação Zod na borda (Function + forms). Hasura checks não bastam para regras de treino.
- IDs de sessão/exercício sempre filtrados por `user_id`.
- Rotas `/admin` no Next.js: session + role no servidor; Hasura ainda restringe dados.
- Admin client apenas em Functions ou scripts de seed CI.
- `.env` gitignored; `.env.example` com chaves públicas e placeholders.

---

## 11. Seeds

Phase 2: muscle groups, movement patterns, equipment categories, bar kinds (linhas), plate weights **como dados**.  
Não seedar milhares de exercícios até haver pipeline de conteúdo.

---

## 12. Observabilidade

Hasura/Nhost logs no cloud. App: erros sem PII (logger com redaction). `audit_logs` e `ai_decisions` para rastreio de produto. Sem gravar prompts internos de raciocínio. Health: `/api/health` (`status`, `service`, `version`).

---

## 13. Checklist Phase 2

- [x] `nhost/` no git (`nhost.toml`, migrations, metadata, seeds, emails `pt`)
- [ ] Projeto local sobe (`nhost up`) — requer Docker na máquina do operador
- [x] Trigger profile (`auth.users` → `profiles` + `athlete_profiles`)
- [x] Permissions `user` isolam atletas; `admin` lê operacional + escreve catálogo
- [x] Buckets criados (`avatars`, `exercise-media`, `equipment-media`, `progress-media`, `documents`)
- [ ] Codegen no CI (schema local ou secret de CI) — config na Phase 3 com `nhost up`
- [ ] GitHub conectado ao cloud (`wqttndghxeybdppcfnol`)
- [x] Nenhum secret no repositório (`.secrets` gitignored)
