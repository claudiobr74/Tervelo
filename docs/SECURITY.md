# Segurança

- Autorização em Hasura + Nhost Functions, nunca só no React.
- `NEXT_PUBLIC_*` só para subdomain/region. Admin secret e chaves de modelo ficam no servidor.
- Não commitar `.env`. Usar `.env.example` sem valores secretos.
- Uploads privados via URLs pré-assinadas, não buckets públicos permanentes.
- Roles: `public` (anônimo), `user` (atleta), `admin` (administrador), `super_admin` (auditoria/IA).
- Admin **não** é atribuído pelo cliente nem pelo `/signup`. Operador: `INSERT INTO auth.user_roles`. Preview local usa `previewRole` (recusado em production).
- Cookie `nhostSession`: httpOnly, SameSite=lax, Secure em production. POST `/api/auth/session` **não** aceita `previewRole: admin` em production (nem no Preview Vercel quando o Nhost cloud está configurado).
- Logs da app: JSON sem PII (e-mail, tokens, FC bruta, nutrição, cargas).
- Headers: CSP, `X-Content-Type-Options`, `X-Frame-Options`, Permissions-Policy (bluetooth permitido para FC).
- Vercel: só `NEXT_PUBLIC_NHOST_SUBDOMAIN` / `REGION` no cliente. Deploy: [`VERCEL.md`](VERCEL.md).
- Dependências e CI devem passar `lint` / `typecheck` / `test` / `build` antes de merge.

Detalhe da Phase 14: [`HARDENING_PRE_IMPLEMENTATION_AUDIT.md`](HARDENING_PRE_IMPLEMENTATION_AUDIT.md).
