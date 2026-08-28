# Nhost (Phase 2)

Backend versionado: PostgreSQL, Hasura, Auth, Storage, Functions.

```bash
# Docker necessário para o stack local
cp .secrets.example .secrets
npm run nhost:jwt              # par RS256 PKCS#8 em .secrets
npm exec nhost -- up
```

## Acesso

| Papel JWT     | Quem                      | Como nasce                        |
| ------------- | ------------------------- | --------------------------------- |
| `user`        | atleta                    | signup (default)                  |
| `admin`       | administrador operacional | operador SQL em `auth.user_roles` |
| `super_admin` | contratos IA + auditoria  | operador SQL                      |

O cliente **nunca** atribui admin. Não existe formulário de “criar administrador”.

1. A pessoa se cadastra em `/signup` (JWT `user`).
2. Operador promove no SQL Editor do Nhost (ou `psql` local):

```sql
INSERT INTO auth.user_roles (id, created_at, user_id, role)
VALUES (gen_random_uuid(), now(), '<user-uuid>', 'admin');
```

Para auditoria e publicação de contratos de IA, o mesmo `INSERT` com `'super_admin'`.

Em **pré-visualização local** (e Preview Vercel sem Nhost cloud) o botão **Dashboard admin** na home grava `previewRole: admin` no cookie. Em production esse campo é recusado.

## Layout

- `nhost.toml` — locale `pt`, roles allowed `user`, `me`, `admin`, `super_admin`
- `migrations/default/` — schema
- `metadata/` — permissions Hasura (matriz em `src/lib/auth/permission-matrix.ts`)
- `seeds/default/001_catalog.sql` — músculos, categorias, padrões
- `emails/pt/` — templates Auth

Regenerar YAML público:

```bash
npm run metadata:generate
```

Este ambiente de cloud **não tem Docker**; `nhost up` fica para a máquina do operador.

## Deploy no Nhost Cloud

O GitHub usa `nhost/nhost.toml`. Qualquer `{{ secrets.NOME }}` **tem** de existir em Settings → Secrets; senão o deploy cai com *invalid configuration*.

| Secret                         | Quem cria                         |
| ------------------------------ | --------------------------------- |
| `HASURA_GRAPHQL_ADMIN_SECRET`  | Nhost (projeto)                   |
| `NHOST_WEBHOOK_SECRET`         | Nhost                             |
| `GRAFANA_ADMIN_PASSWORD`       | Nhost                             |
| `NHOST_JWT_KID`                | `npm run nhost:jwt` — cole no Cloud o valor gerado |
| `NHOST_JWT_PUBLIC_KEY`         | idem, PEM completo (`BEGIN PUBLIC KEY`) |
| `NHOST_JWT_PRIVATE_KEY`        | idem, PEM PKCS#8 (`BEGIN PRIVATE KEY`) |

Se o dashboard mostrar Auth em **UpdateError** / `exitCode: 1` e Hasura/Postgres/Storage verdes: a replica nova do Auth não conseguiu assinar JWT. Quase sempre a privada está truncada, sem quebra de linha, ou ainda é o placeholder `run-npm-run-nhost-jwt`. Hasura só verifica a pública, então pode continuar saudável.

1. `npm run nhost:jwt`
2. Settings → Secrets: criar/atualizar os três nomes com o PEM inteiro (linhas BEGIN/END visíveis).
3. Redeploy (ou um commit vazio / “Redeploy” no GitHub).

Não referenciar secrets extras (`APP_URL`, SMTP, etc.) no TOML até estarem criados no dashboard. Conferir localmente: `cp .secrets.example .secrets && npm run nhost:jwt && npm exec nhost -- config validate`.
