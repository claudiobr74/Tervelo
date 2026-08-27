# Nhost (Phase 2)

Backend versionado: PostgreSQL, Hasura, Auth, Storage, Functions.

```bash
# Docker necessário para o stack local
cp .secrets.example .secrets   # preencher; `nhost init` também gera
npm exec nhost -- up
```

## Acesso

| Papel JWT | Quem | Como nasce |
| --- | --- | --- |
| `user` | atleta | signup (default) |
| `admin` | administrador operacional | operador SQL em `auth.user_roles` |
| `super_admin` | contratos IA + auditoria | operador SQL |

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
