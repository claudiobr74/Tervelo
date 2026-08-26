# Segurança

- Autorização em Hasura + Nhost Functions, nunca só no React.
- `NEXT_PUBLIC_*` só para subdomain/region. Admin secret e chaves de modelo ficam no servidor.
- Não commitar `.env`. Usar `.env.example` sem valores secretos.
- Uploads privados via URLs pré-assinadas, não buckets públicos permanentes.
- Roles: `public`, `user`, `admin`, `super_admin`. Admin não é atribuído pelo cliente.
- Dependências e CI devem passar `lint` / `typecheck` / `test` / `build` antes de merge.
