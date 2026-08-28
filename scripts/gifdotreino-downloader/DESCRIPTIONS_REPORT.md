# Nomes e descrições — Gif do Treino → Tervelo

Gerado em 2026-08-28. Autorização declarada pelo responsável do conteúdo.

## Avaliação

O `catalog.json` da coleta de GIFs **não** traz ficha real: o campo `description` é placeholder (`Descrição para o exercício: {nome}`).

A ficha de verdade está em `https://www.gifdotreino.com/Descrição/{nome}.txt` (HTML). O site tira o `<p><strong>…</strong></p>` e injeta o resto no modal.

O Tervelo guarda isso em `canonical_exercises.name_pt` + `canonical_exercises.description` (texto, não HTML — a UI não usa `innerHTML`).

GIFs entram no app pela API autenticada `/api/catalog/gif/[slug]` (disco local) e, no Cloud, pelo bucket `exercise-media`. Sem hotlink.

## Resultado da extração

| Métrica | Valor |
|---------|-------|
| Exercícios | 963 |
| Descrições baixadas | 962 |
| Sem ficha no site | 1 — *Remada Inclinada a 45 Graus* (404) |
| Tamanho do texto | 793–1812 caracteres (todas cabem na coluna `text`) |
| Padrão de movimento inferido da pasta | 480 (Peitoral, Costas, Pernas, etc.) |
| Sem padrão (Calistenia, Cardio, Mobilidade, Funcional, Crossfit) | 483 |

## O que entra no app

1. JSON extraído: `scripts/gifdotreino-downloader/output/metadata/exercises.json`
2. Seed de nomes/descrições: `nhost/seeds/default/003_gifdotreino_exercises.sql`
3. Seed de mídia: `nhost/seeds/default/004_gifdotreino_media.sql` (`object_key`)
4. Alias = pasta do site (Peitoral, Costas, …)
5. Atleta: `/app/exercises` — lista (título + categoria) e ficha (GIF + descrição)
6. Admin: `/admin/exercises` — a mesma ficha

## Como aplicar no Nhost (operador)

O Cloud **não** aplica seed do git sozinho. Na máquina com Docker, depois de `nhost up`:

```bash
npm exec nhost -- seed apply
```

Ou `psql` / SQL Editor com o arquivo `003` (2,5 MB — o editor do dashboard pode recusar; prefira `psql -f`).

Ordem: migration `exercise_media` → `001` → `002` → `003` → `004`.

## Não feito

- Upload dos GIFs ao bucket Nhost `exercise-media` (`file_id`)
- Aplicar seeds no projeto Cloud desta sessão
- Variantes / músculos / equipment_models para os 963 nomes
