# Functions (Nhost)

HTTP handlers no servidor. JWT obrigatório. Admin secret só aqui, nunca no Next.js.

| Rota              | Fase | Papel                                                               |
| ----------------- | ---- | ------------------------------------------------------------------- |
| `/ai/orchestrate` | 9    | atleta autenticado; monta contexto com client admin **no servidor** |

Promover `admin` / `super_admin` **não** é Function pública: `INSERT` em `auth.user_roles` pelo operador SQL.
