# Segurança

- Autorização em Hasura + Nhost Functions, nunca só no React.
- `NEXT_PUBLIC_*` só para subdomain/region. Admin secret e chaves de modelo ficam no servidor.
- Não commitar `.env`. Usar `.env.example` sem valores secretos.
- Uploads privados via URLs pré-assinadas, não buckets públicos permanentes.
- Roles: `public` (anônimo), `user` (atleta), `admin` (administrador), `super_admin` (auditoria/IA).
- Admin **não** é atribuído pelo cliente. Operador: `INSERT INTO auth.user_roles`.
- Dependências e CI devem passar `lint` / `typecheck` / `test` / `build` antes de merge.
