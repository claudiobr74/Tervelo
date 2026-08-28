# Gif do Treino Downloader

Downloader para a migração **autorizada** da biblioteca pública de [gifdotreino.com](https://www.gifdotreino.com/).

Os GIFs entram no Tervelo pelo **storage próprio**. Não usar hotlink do site em produção.

## Como baixa

A página carrega os exercícios via `search_gifs.php` (20 por página) e `get_exercise_folders.php`. O downloader usa esses mesmos endpoints — não é mock.

O clique em **Visualizar** (Playwright) só vê o que o infinite scroll já renderizou. Por isso o padrão é a API do catálogo.

- não converte, recomprime ou altera os GIFs originais
- deduplica por SHA-256
- valida magia `GIF87a` / `GIF89a`
- categoria vem do caminho `Exercicios/{pasta}/{nome}.gif`
- gera `manifest.json`, `manifest.csv`, `errors.json` e `MIGRATION_REPORT.md`

## Instalação

Na raiz do Tervelo:

```bash
npm install
npx playwright install chromium   # só se for usar --browser / --headed
```

## Rodar

Da raiz:

```bash
# 1. Só o catálogo (sem baixar bytes)
npm run catalog:gifs -- --dry-catalog --limit 5

# 2. Teste pequeno (5 GIFs)
npm run catalog:gifs:probe

# 3. Biblioteca completa (~960 GIFs, ~3 GB)
npm run catalog:gifs
```

Playwright (validação do modal **Visualizar**):

```bash
npm run catalog:gifs:headed          # --browser --headed
npm run catalog:gifs:debug           # headed + slowMo
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --browser-full --headed
```

Neste ambiente de cloud o headed não tem display: use o probe headless.

### Opções

```bash
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --limit 20
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --concurrency 4
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --dry-catalog
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --fresh
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --out ./meus_gifs
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --url https://www.gifdotreino.com/
node scripts/gifdotreino-downloader/download_gifdotreino.mjs --browser --headed
```

`--fresh` ignora o manifest anterior. Sem essa flag, a coleta retoma arquivos já salvos.

## Saída

```text
scripts/gifdotreino-downloader/output/
├── gifs/                      # gitignored
│   ├── peitoral/
│   ├── costas/
│   └── …
├── metadata/
│   ├── catalog.json
│   ├── manifest.json
│   ├── manifest.csv
│   ├── errors.json
│   └── network_gifs.json
├── logs/                      # gitignored
└── MIGRATION_REPORT.md
```

Cópia do relatório também em `scripts/gifdotreino-downloader/MIGRATION_REPORT.md`.

Cada item do manifest:

- `id`, `name`, `slug`, `category`, `file`, `source_url`, `origin`, `bytes`, `sha256`, `downloaded_at`

## Tervelo

Depois da coleta, **não** fazer upload ao Nhost sem revisar o relatório.

Próximo passo (outra tarefa): bucket `exercise-media` + `exercise_media.file_id`. Sem hotlink.

## Observação

A automação não contorna autenticação, paywall nem proteção de acesso. Captura só o que a página publica para qualquer visitante.
