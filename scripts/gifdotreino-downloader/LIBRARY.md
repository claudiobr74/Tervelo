# Biblioteca no app — avaliação e apresentação

Autorização declarada pelo responsável do conteúdo (Gif do Treino). Sem hotlink.

## Avaliação (o que **não** fazer)

| Caminho | Por quê recusar |
| --- | --- |
| Commitar ~2,5 GB de GIFs ou copiar para `public/` | Git e Vercel não aguentam; o deploy quebra. |
| Hotlink `gifdotreino.com` | Fora do contrato; some se o site cair; CSP/`img-src` não libera o domínio. |
| Religar `PREVIEW_*` / catálogo Figma de 2 nomes | Isso é dado inventado. A biblioteca autorizada é o catálogo real. |
| UNIQUE em `exercise_media.object_key` | *Stiff com barra* e *Peso muerto…* compartilham o mesmo arquivo. |

Caminho adequado:

1. **Títulos e descrições** no JSON `output/metadata/exercises.json` e no seed `003`.
2. **GIFs** no disco local (`output/gifs/`, gitignored) servidos por `/api/catalog/gif/[slug]` com sessão. Depois: upload ao bucket Nhost `exercise-media` e `exercise_media.file_id`.
3. **Tabela** `exercise_media` (migration) + seed `004` com `object_key` = caminho relativo. Sem `file_id` até o upload.
4. **Apresentação** mesmo sem o Cloud ter o seed: as APIs `/api/me/catalog` e `/api/admin/exercises` leem a biblioteca autorizada e, se o Nhost tiver linhas, fazem overlay pelo `name_pt`.

## Como o atleta vê

Rota: `/app/exercises` (Ficha da biblioteca — não é a tela de execução da série).

Entrada no app:

- **Mais → Biblioteca de exercícios**
- Hoje, sem treino prescrito: atalho **Biblioteca**
- Sessão vazia: **Ver biblioteca de exercícios**
- Plano: checkboxes da mesma biblioteca (com filtro)

Fluxo:

1. Lista rolável com **título** e **categoria** (Peitoral, Costas, …). Sem GIF na lista (963 arquivos × ~3 MB).
2. Toque abre a **ficha**: GIF em loop (`<img>`, `object-contain`), título, descrição em texto (`whitespace-pre-wrap`, sem HTML), categoria e padrão quando existir.
3. **Voltar à lista** guarda a busca. Favorito fica no aparelho (`localStorage`).
4. Só um GIF por vez. Anônimo leva 401 no endpoint do GIF.

Admin `/admin/exercises`: a mesma ficha no painel direito (GIF + descrição).

`/app/workout/exercise` continua sendo execução de série, não a ficha.

## Aplicar no Nhost (operador)

Ordem: migrations (`…_exercise_media`) → seeds `001` → `002` → `003` → `004`.

```bash
npm run catalog:media-seed   # regenera 004 a partir do JSON
```

Upload dos GIFs ao bucket `exercise-media` é passo seguinte; esta entrega já mostra os arquivos locais a quem tem a pasta `output/gifs`.
