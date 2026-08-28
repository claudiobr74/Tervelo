# Migração Gif do Treino → Tervelo

Gerado em 2026-08-28T22:12:41.703Z.
Fonte: `https://www.gifdotreino.com/`.
Autorização declarada pelo responsável do conteúdo. GIFs copiados sem recompressão.

## Totais

| Métrica | Valor |
|---------|-------|
| Exercícios identificados no catálogo | 963 |
| Nomes no manifest | 963 |
| GIFs únicos por SHA-256 | 962 |
| Duplicatas por SHA-256 (mesmo arquivo, outro nome) | 1 |
| Nomes do catálogo sem arquivo | 0 |
| Arquivos inválidos (magic/vazio) | 0 |
| Falhas/avisos em errors.json | 0 |
| Volume baixado | 2677.8 MB |
| Modo | API search_gifs.php |
| Concorrência | 4 |
| Limite | nenhum |

## Por categoria

- Antebraços: 14
- Bíceps: 52
- Calistenia: 123
- Cardio: 11
- Costas: 60
- Crossfit: 56
- Eretor Lombar: 8
- Funcional e HIT: 163
- Glúteos: 23
- Mobilidade: 130
- Ombros: 74
- Panturrilhas: 18
- Peitoral: 68
- Pernas: 81
- Trapézio: 33
- Tríceps: 49

## Duplicatas de conteúdo

- Stiff com barra = Peso muerto piernas rígidas con barra (`gifs/pernas/peso-muerto-piernas-rigidas-con-barra.gif`)

## Nomes sem correspondência

_nenhum_

## Falhas

Ver `output/metadata/errors.json` (0 entradas).

## Estrutura resultante

```text
output/
├── gifs/                 # bytes originais (gitignored)
├── metadata/
│   ├── catalog.json
│   ├── manifest.json
│   ├── manifest.csv
│   ├── errors.json
│   ├── duplicates.json
│   └── network_gifs.json
└── MIGRATION_REPORT.md
```

## Recomendações para o storage do Tervelo

1. **Não** usar hotlink de gifdotreino.com em produção.
2. Fazer upload dos arquivos de `output/gifs/` para o bucket Nhost `exercise-media`.
3. Persistir `file_id` em `exercise_media` ligado ao canônico/variante correspondente.
4. Mapear `manifest.json` (name/slug/category) para `canonical_exercises` / aliases — nomes do site não são 1:1 com o seed Tervelo.
5. Preferir WebM/MP4 no app no futuro; nesta etapa os GIFs permanecem intactos.
6. Não commitar os binários no git (~3 GB). Versionar só metadata + este relatório.
7. Só fazer o upload depois de revisar este relatório.

## Validação

- Probe de 5 GIFs: magia GIF89a, 1080×1080, 0 falhas.
- Playwright headless: 20 botões Visualizar na primeira página; modal `#modal-gif` / `#modal-name` / `#close-modal` ok. Headed não rodou neste ambiente (sem display).
- Arquivos em disco: 962 GIFs válidos; 1 nome extra aponta para o mesmo SHA-256.

## Não feito nesta etapa

- Upload para Nhost Storage / Hasura
- Seed SQL de exercícios
- Conversão ou recompressão
