# Functions (Nhost)

HTTP handlers no servidor. JWT obrigatório. Admin secret só aqui, nunca no Next.js.

| Rota              | Fase | Papel                                                                                                                                      |
| ----------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/ai/orchestrate` | 9    | JWT obrigatório; hoje responde **501** (`not_implemented`). Sem modelo nem gravação em `ai_runs` / `ai_decisions` até a orquestração real. |

Promover `admin` / `super_admin` **não** é Function pública: `INSERT` em `auth.user_roles` pelo operador SQL.
