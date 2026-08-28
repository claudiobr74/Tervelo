# Como ver os GIFs no Tervelo

Os ~2,5 GB **não** vão no git nem no preview da Vercel. Por isso a ficha mostra título e descrição, mas o movimento fica em branco até os arquivos existirem **no seu disco** ou **no Nhost**.

Há dois caminhos. O 1 é o mais rápido. O 2 é o que vale para o preview e para produção.

---

## Caminho 1 — ver agora no seu computador

1. Na sua máquina, clone o repositório e entre neste branch (`cursor/gif-downloader-c3ef` ou o que estiver no PR).
2. Instale as dependências:

```bash
npm install
```

3. Baixe os GIFs (uma vez, ~2,5 GB, vários minutos):

```bash
npm run catalog:gifs
```

Confira:

```bash
find scripts/gifdotreino-downloader/output/gifs -name '*.gif' | wc -l
# esperado: 962
```

Se essa pasta já existir com os 962 arquivos, pule o download.

4. Copie o exemplo de ambiente (login de demonstração serve neste caminho):

```bash
cp .env.example .env.local
```

Não precisa preencher Nhost para só ver o GIF local.

5. Suba o app:

```bash
npm run dev
```

6. Abra `http://localhost:3000/login`, entre, vá em **Mais → Biblioteca de exercícios**.
7. Toque num exercício. O GIF anima em loop na ficha.

Sem a pasta `output/gifs`, a API `/api/catalog/gif/[slug]` responde 404 e a ficha explica que o arquivo não está neste servidor.

---

## Caminho 2 — ver no preview Vercel / produção

O preview não tem disco com 2,5 GB. Os GIFs precisam ir ao bucket Nhost **exercise-media**. Depois o app (já neste PR) busca o arquivo no Storage e serve em `/api/catalog/gif/[slug]`.

### 2.1 Conta e env

1. Dashboard Nhost do projeto `wqttndghxeybdppcfnol` (região `sa-east-1`).
2. No `.env.local` da **sua** máquina:

```bash
NEXT_PUBLIC_NHOST_SUBDOMAIN=wqttndghxeybdppcfnol
NEXT_PUBLIC_NHOST_REGION=sa-east-1
NHOST_ADMIN_SECRET=     # Settings → Hasura GraphQL Admin Secret
```

O secret **não** vai no git. Não cole no chat.

Opcional: se o Storage recusar o admin secret, entre no app como **admin**, copie o access token da sessão e use `NHOST_ACCESS_TOKEN`.

3. Na Vercel: Project → Settings → Environment Variables, **Preview** e **Production**:

| Nome                          | Onde                           |
| ----------------------------- | ------------------------------ |
| `NEXT_PUBLIC_NHOST_SUBDOMAIN` | já deve existir                |
| `NEXT_PUBLIC_NHOST_REGION`    | já deve existir                |
| `NHOST_ADMIN_SECRET`          | só servidor; não `NEXT_PUBLIC` |

O admin secret no servidor deixa o GIF funcionar mesmo com login de demonstração. Sem ele, entre no preview com **conta real** do Nhost (não o login de demo).

### 2.2 Banco (uma vez)

No Nhost Cloud, nesta ordem:

1. Aplicar a migration `nhost/migrations/default/20260828223000_exercise_media/up.sql`  
   (SQL Editor, ou deixe o deploy Hasura do git aplicar).
2. Seeds, nesta ordem: `001_catalog.sql` → `002_exercises_equipment.sql` → `003_gifdotreino_exercises.sql` → `004_gifdotreino_media.sql`.

O `003` tem ~2,4 MB: o SQL Editor do dashboard pode recusar. Use `psql` com a connection string do dashboard:

```bash
psql "$NHOST_POSTGRES_URL" -f nhost/seeds/default/001_catalog.sql
psql "$NHOST_POSTGRES_URL" -f nhost/seeds/default/002_exercises_equipment.sql
psql "$NHOST_POSTGRES_URL" -f nhost/seeds/default/003_gifdotreino_exercises.sql
psql "$NHOST_POSTGRES_URL" -f nhost/seeds/default/004_gifdotreino_media.sql
```

Os GIFs **já aparecem** depois do upload (passo 2.3) mesmo se o `004` ainda não tiver `file_id`: a API acha o arquivo pelo nome no bucket. O `004` + `file_id` é o vínculo canônico.

### 2.3 Upload dos GIFs (na sua máquina)

A pasta `output/gifs` precisa existir (passo 1.3). Depois:

```bash
# teste com 3 arquivos
npm run catalog:gifs:upload -- --limit 3

# biblioteca inteira (~962 arquivos, ~2,5 GB; retoma o que já subiu)
npm run catalog:gifs:upload
```

O script:

- envia cada GIF ao bucket `exercise-media` com `name` = `gifs/{categoria}/{slug}.gif`;
- pula o que já existe;
- grava `exercise_media.file_id` se a tabela existir.

Leva dezenas de minutos na primeira vez. Deixe rodar até o JSON final com `uploaded` / `skipped` / `failed`.

### 2.4 Conferir no app

1. Espere o deploy deste branch (a API precisa do fallback Nhost).
2. Abra o preview, **entre com sessão** (conta Nhost, ou demo se o `NHOST_ADMIN_SECRET` estiver na Vercel).
3. **Mais → Biblioteca de exercícios** → toque no exercício.
4. O GIF deve animar. Se continuar a mensagem de “não está neste servidor”, o upload ainda não achou o `name` no bucket ou a sessão não alcança o Nhost.

---

## O que **não** fazer

- Não copiar os GIFs para `public/` nem commitar no git (o deploy da Vercel quebra).
- Não usar hotlink de `gifdotreino.com`.
- Não religar `PREVIEW_*` / catálogo inventado.

Detalhe da avaliação: [LIBRARY.md](./LIBRARY.md).
