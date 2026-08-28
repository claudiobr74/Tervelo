# PROMPT PARA O CURSOR — executar migração dos GIFs autorizados

Temos autorização do responsável pelo conteúdo para migrar os GIFs públicos exibidos em `https://www.gifdotreino.com/`.

Use o pacote em `scripts/gifdotreino-downloader`.

Objetivos:
1. Instalar as dependências.
2. Instalar o Chromium do Playwright.
3. Rodar inicialmente `npm run catalog:gifs:probe` (5 GIFs, headless). Em máquina com display: `npm run catalog:gifs:headed`.
4. Se o teste estiver correto, rodar a biblioteca completa com `npm run catalog:gifs` (API pública `search_gifs.php` — o mesmo endpoint da página, não mock).
5. Não recomprimir nem alterar os GIFs originais nesta etapa.
6. Não usar hotlink em produção.
7. Preservar `manifest.json` e `manifest.csv`.
8. Validar:
   - quantidade total de exercícios identificados;
   - quantidade de GIFs efetivamente baixados;
   - duplicatas por SHA-256;
   - arquivos inválidos ou vazios;
   - nomes sem correspondência;
   - falhas em `errors.json`.
9. Se o DOM atual tiver mudado, faça apenas os ajustes mínimos nos seletores do downloader. Não substitua por mocks.
10. Ao final, gere `MIGRATION_REPORT.md` com totais, falhas e recomendações para upload ao storage do Tervelo.

Depois da coleta, NÃO faça upload ao banco/storage sem antes me mostrar o relatório e a estrutura resultante.
