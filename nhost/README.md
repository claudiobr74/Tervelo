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

O cliente **nunca** atribui admin.

```sql
INSERT INTO auth.user_roles (id, created_at, user_id, role)
VALUES (gen_random_uuid(), now(), '<user-uuid>', 'admin');
```

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
