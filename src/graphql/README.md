# GraphQL

Documents por domínio, um arquivo por operação.

Codegen (`graphql-codegen`) contra schema local exige `nhost up` (Docker). Sem isso, os tipos de produto vivem em `src/domain` e as portas em `src/application/ports.ts`.

Não colocar strings GraphQL em componentes.

Pastas: `athlete` (role `user`), `admin` (role `admin` / `super_admin`), `training`, `body`, `recovery`, e depois `nutrition`, `ai`.
