# Segurança

- Autorização em Hasura + Nhost Functions, nunca só no React.
- `NEXT_PUBLIC_*` só para subdomain/region. Admin secret e chaves de modelo ficam no servidor.
- Não commitar `.env`. Usar `.env.example` sem valores secretos.
- Uploads privados via URLs pré-assinadas, não buckets públicos permanentes.
- Roles: `public` (anônimo), `user` (atleta), `admin` (administrador), `super_admin` (auditoria/IA).
- Admin **não** é atribuído pelo cliente nem pelo `/signup`. Operador: `INSERT INTO auth.user_roles`. Preview local usa `previewRole` (recusado em production).
- Cookie `nhostSession`: httpOnly, SameSite=lax, Secure em production. POST `/api/auth/session` **não** aceita `previewRole: admin` em production (nem no Preview Vercel quando o Nhost cloud está configurado).
- Papel de administrador só vale com **assinatura verificada** contra o JWKS do Nhost (`src/lib/auth/jwt.ts`). Decodificar o payload não prova origem: um cookie forjado não passa. A checagem é refeita no layout de `/admin`, não só no proxy.
- Cookie `terveloUser`: apenas o id do usuário, legível pelo cliente. Serve para separar o armazenamento offline entre contas no mesmo aparelho. Nunca guarda token.
- Cookie `terveloOnboarding`: httpOnly, gravado só com sessão válida e apagado no logout — conclusão de cadastro é por conta, não por navegador.
- O token de acesso nunca é lido pelo navegador. A sincronização passa por `/api/sync/graphql`, que anexa o `Authorization` a partir do cookie. As permissões continuam sendo decididas pelo Hasura.
- Logs da app: JSON sem PII (e-mail, tokens, FC bruta, nutrição, cargas).
- Headers: CSP com **nonce por requisição** (sem `unsafe-inline` em script), `connect-src` restrito aos domínios Nhost, HSTS em production, `X-Content-Type-Options`, `X-Frame-Options`, Permissions-Policy (bluetooth permitido para FC).
- Rate limit das rotas de API é **em memória, por instância** (`src/lib/security/rate-limit.ts`). Em serverless isso é defesa parcial: para produção com tráfego real, complementar com rate limit distribuído (KV/Firewall) ou com o rate limit nativo do Nhost Auth.
- Vercel: só `NEXT_PUBLIC_NHOST_SUBDOMAIN` / `REGION` no cliente. Deploy: [`VERCEL.md`](VERCEL.md).
- Dependências e CI devem passar `format:check` / `lint` / `typecheck` / `test` / `build` / `test:e2e` antes de merge.

Detalhe da Phase 14: [`HARDENING_PRE_IMPLEMENTATION_AUDIT.md`](HARDENING_PRE_IMPLEMENTATION_AUDIT.md).
