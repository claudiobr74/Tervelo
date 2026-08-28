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
- `seeds/default/002_exercises_equipment.sql` — catálogo mínimo (2 exercícios)
- `seeds/default/003_gifdotreino_exercises.sql` — nomes + descrições da biblioteca Gif do Treino (autorizada)
- `seeds/default/004_gifdotreino_media.sql` — `exercise_media.object_key` (GIF local; `file_id` depois do upload)
- `emails/pt/` — templates Auth

Regenerar YAML público:

```bash
npm run metadata:generate
```

Este ambiente de cloud **não tem Docker**; `nhost up` fica para a máquina do operador.

Seeds **não** sobem sozinhos para o Nhost Cloud. Depois de `001` e `002`, aplicar `003_gifdotreino_exercises.sql` e `004_gifdotreino_media.sql` com `npm exec nhost -- seed apply` ou `psql -f` (o SQL Editor pode recusar o arquivo de 2,5 MB do `003`). A migration `20260828223000_exercise_media` precisa existir antes do `004`.

## Deploy no Nhost Cloud

O GitHub usa `nhost/nhost.toml`. Qualquer `{{ secrets.NOME }}` **tem** de existir em Settings → Secrets; senão o deploy cai com _invalid configuration_.

| Secret                        | Quem cria                                          |
| ----------------------------- | -------------------------------------------------- |
| `HASURA_GRAPHQL_ADMIN_SECRET` | Nhost (projeto)                                    |
| `NHOST_WEBHOOK_SECRET`        | Nhost                                              |
| `GRAFANA_ADMIN_PASSWORD`      | Nhost                                              |
| `NHOST_JWT_KID`               | `npm run nhost:jwt` — cole no Cloud o valor gerado |
| `NHOST_JWT_PUBLIC_KEY`        | idem, PEM completo (`BEGIN PUBLIC KEY`)            |
| `NHOST_JWT_PRIVATE_KEY`       | idem, PEM PKCS#8 (`BEGIN PRIVATE KEY`)             |

Se o dashboard mostrar Auth em **UpdateError** / `exitCode: 1` e Hasura verde, os _nomes_ dos secrets JWT já existem — o deploy passou da validação de config. A replica nova do Auth mesmo assim não sobe porque não consegue **usar** a chave privada:

- Hasura só lê a **pública** (`key`) → pode ficar verde.
- Auth 0.49.1 exige PEM PKCS#8 em `signing_key` (`-----BEGIN PRIVATE KEY-----` com quebras de linha). Pública ok + privada truncada, numa linha só, `BEGIN RSA PRIVATE KEY` mal colada, ou JSON com `signingKey` em vez de `signing_key` → `exit 1` e `message` vazio no Service State.

O Nhost **não preenche** `NHOST_JWT_*`. Secret vazio (só o nome) interpola string vazia: o deploy passa e o Auth cai com `exit 1`. Gerar o par (não buscar no dashboard):

```bash
npm run nhost:jwt
```

Cole o PEM impresso em Settings → Secrets → editar o nome já criado. Não recrie o secret. Não altere `HASURA_GRAPHQL_ADMIN_SECRET`, `NHOST_WEBHOOK_SECRET` nem `GRAFANA_ADMIN_PASSWORD` — esses o Nhost já preenche na criação do projeto.

Não referenciar secrets extras (`APP_URL`, SMTP, etc.) no TOML até estarem criados no dashboard. Conferir localmente: `cp .secrets.example .secrets && npm run nhost:jwt && npm exec nhost -- config validate`.
