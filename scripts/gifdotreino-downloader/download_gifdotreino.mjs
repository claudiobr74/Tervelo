#!/usr/bin/env node
/**
 * Migração autorizada dos GIFs públicos de gifdotreino.com.
 * Padrão: catálogo via search_gifs.php (o mesmo endpoint da página).
 * --browser: fluxo Playwright (botão Visualizar), para validar o DOM.
 * Não recomprime nem altera os bytes originais.
 */

import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const HEADED = process.argv.includes("--headed");
const BROWSER = process.argv.includes("--browser") || HEADED;
const DRY = process.argv.includes("--dry-catalog");
const FRESH = process.argv.includes("--fresh");
const SLOW = Number(arg("--slow", 0)) || 0;
const LIMIT = Number(arg("--limit", 0)) || 0;
const CONCURRENCY = Math.max(1, Number(arg("--concurrency", 4)) || 4);
const START_URL = String(arg("--url", "https://www.gifdotreino.com/"));
const OUT = path.resolve(String(arg("--out", path.join(__dirname, "output"))));
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";

const GIF_DIR = path.join(OUT, "gifs");
const META_DIR = path.join(OUT, "metadata");
const LOG_DIR = path.join(OUT, "logs");

const seenUrls = new Set();
const networkGifs = [];
const errors = [];
const duplicates = [];
const manifest = [];
const byHash = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function slugify(value) {
  return (
    String(value || "exercicio")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 150) || "exercicio"
  );
}

export function looksLikeGif(url = "", contentType = "") {
  const u = String(url).toLowerCase();
  const ct = String(contentType).toLowerCase();
  return ct.includes("image/gif") || /\.gif(?:$|[?#])/.test(u);
}

export function isGifMagic(buffer) {
  if (!buffer || buffer.length < 6) return false;
  const sig = buffer.subarray(0, 6).toString("ascii");
  return sig === "GIF87a" || sig === "GIF89a";
}

export function absoluteFromSite(rel) {
  const base = START_URL.endsWith("/") ? START_URL : `${START_URL}/`;
  const encoded = String(rel)
    .replace(/^\//, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return new URL(encoded, base).href;
}

export function categoryFromPath(relPath, fallback = "sem-categoria") {
  const parts = String(relPath || "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean);
  if (parts.length >= 3 && /^exercicios$/i.test(parts[0])) return parts[1];
  if (parts.length >= 2) return parts[0];
  return fallback;
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function saveBuffer({
  buffer,
  name,
  sourceUrl,
  category = "sem-categoria",
  origin = "unknown",
}) {
  const hash = sha256(buffer);
  if (byHash.has(hash)) {
    const existing = byHash.get(hash);
    if (name && !manifest.some((item) => item.name === name)) {
      const alias = {
        ...existing,
        id: `GDT-${String(manifest.length + 1).padStart(4, "0")}`,
        name,
        slug: slugify(name),
        category,
        source_url: sourceUrl,
        origin: `${origin}-duplicate`,
        downloaded_at: new Date().toISOString(),
      };
      manifest.push(alias);
      duplicates.push({
        name,
        duplicate_of: existing.name,
        sha256: hash,
        file: existing.file,
      });
      console.log(`↻ ${name} duplicata de ${existing.name} (${existing.file})`);
    }
    seenUrls.add(sourceUrl);
    return existing;
  }

  if (!isGifMagic(buffer)) {
    throw new Error(`não é GIF (magic inválido): ${sourceUrl}`);
  }
  if (buffer.length < 100) {
    throw new Error(`arquivo vazio/pequeno: ${sourceUrl}`);
  }

  const categorySlug = slugify(category);
  const dir = path.join(GIF_DIR, categorySlug);
  await fs.mkdir(dir, { recursive: true });

  const base = slugify(name);
  let filename = `${base}.gif`;
  let full = path.join(dir, filename);
  let n = 2;
  while (fssync.existsSync(full)) {
    filename = `${base}-${n++}.gif`;
    full = path.join(dir, filename);
  }

  await fs.writeFile(full, buffer);

  const item = {
    id: `GDT-${String(manifest.length + 1).padStart(4, "0")}`,
    name,
    slug: slugify(name),
    category,
    file: path.relative(OUT, full).replaceAll("\\", "/"),
    source_url: sourceUrl,
    origin,
    bytes: buffer.length,
    sha256: hash,
    downloaded_at: new Date().toISOString(),
  };
  manifest.push(item);
  byHash.set(hash, item);
  seenUrls.add(sourceUrl);
  console.log(`✓ ${item.name} -> ${item.file} (${item.bytes} bytes)`);
  return item;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: START_URL, Accept: "application/json,text/plain,*/*" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchFolders() {
  try {
    const folders = await fetchJson(new URL("get_exercise_folders.php", START_URL).href);
    return Array.isArray(folders) ? folders : [];
  } catch (e) {
    errors.push({ url: "get_exercise_folders.php", error: String(e) });
    console.warn("Não foi possível listar pastas:", String(e));
    return [];
  }
}

async function fetchCatalogPage(page) {
  const url = new URL("search_gifs.php", START_URL);
  url.searchParams.set("q", "");
  url.searchParams.set("folders", "[]");
  url.searchParams.set("page", String(page));
  return fetchJson(url.href);
}

async function fetchCatalog() {
  const seen = new Map();
  let page = 1;
  while (page <= 500) {
    const batch = await fetchCatalogPage(page);
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const item of batch) {
      if (!item?.name || !item?.path) continue;
      if (!seen.has(item.name)) seen.set(item.name, item);
    }
    console.log(`  catálogo página ${page}: ${batch.length} (únicos ${seen.size})`);
    if (LIMIT && seen.size >= LIMIT) break;
    page += 1;
  }
  let items = [...seen.values()];
  if (LIMIT) items = items.slice(0, LIMIT);
  return items;
}

async function downloadUrl(url, meta = {}) {
  if (!url) return null;
  if (seenUrls.has(url)) {
    return manifest.find((item) => item.source_url === url) ?? null;
  }

  try {
    const res = await fetch(url, {
      headers: { Referer: START_URL, "User-Agent": UA },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    return await saveBuffer({ buffer, sourceUrl: url, ...meta });
  } catch (e) {
    errors.push({ url, error: String(e), meta });
    console.error(`✗ ${meta.name || "GIF"}: ${String(e)}`);
    return null;
  }
}

async function mapPool(items, n, fn) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()));
}

async function writeMetadata(catalog) {
  await fs.mkdir(META_DIR, { recursive: true });
  const sorted = [...manifest].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  await fs.writeFile(path.join(META_DIR, "catalog.json"), JSON.stringify(catalog, null, 2), "utf8");
  await fs.writeFile(path.join(META_DIR, "manifest.json"), JSON.stringify(sorted, null, 2), "utf8");
  await fs.writeFile(path.join(META_DIR, "errors.json"), JSON.stringify(errors, null, 2), "utf8");
  await fs.writeFile(
    path.join(META_DIR, "duplicates.json"),
    JSON.stringify(duplicates, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(META_DIR, "network_gifs.json"),
    JSON.stringify(networkGifs, null, 2),
    "utf8",
  );
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [
    ["id", "name", "slug", "category", "file", "source_url", "origin", "bytes", "sha256"]
      .map(esc)
      .join(","),
    ...sorted.map((x) =>
      [x.id, x.name, x.slug, x.category, x.file, x.source_url, x.origin, x.bytes, x.sha256]
        .map(esc)
        .join(","),
    ),
  ].join("\n");
  await fs.writeFile(path.join(META_DIR, "manifest.csv"), csv, "utf8");
}

async function writeReport(catalog) {
  const byCategory = {};
  for (const item of manifest) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  }
  const downloadedNames = new Set(manifest.map((x) => x.name));
  const missing = catalog.filter((c) => !downloadedNames.has(c.name)).map((c) => c.name);
  const invalid = errors.filter((e) => /magic|vazio|pequeno/i.test(String(e.error)));
  const uniqueHashes = new Set(manifest.map((x) => x.sha256)).size;
  const dupes = manifest.length - uniqueHashes;
  const hashed = new Set();
  let totalBytes = 0;
  for (const item of manifest) {
    if (hashed.has(item.sha256)) continue;
    hashed.add(item.sha256);
    totalBytes += item.bytes;
  }
  const md = `# Migração Gif do Treino → Tervelo

Gerado em ${new Date().toISOString()}.
Fonte: \`${START_URL}\`.
Autorização declarada pelo responsável do conteúdo. GIFs copiados sem recompressão.

## Totais

| Métrica | Valor |
|---------|-------|
| Exercícios identificados no catálogo | ${catalog.length} |
| Nomes no manifest | ${manifest.length} |
| GIFs únicos por SHA-256 | ${uniqueHashes} |
| Duplicatas por SHA-256 (mesmo arquivo, outro nome) | ${dupes} |
| Nomes do catálogo sem arquivo | ${missing.length} |
| Arquivos inválidos (magic/vazio) | ${invalid.length} |
| Falhas/avisos em errors.json | ${errors.length} |
| Volume baixado | ${(totalBytes / 1e6).toFixed(1)} MB |
| Modo | ${BROWSER ? "Playwright (Visualizar)" : "API search_gifs.php"} |
| Concorrência | ${CONCURRENCY} |
| Limite | ${LIMIT || "nenhum"} |

## Por categoria

${
  Object.entries(byCategory)
    .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n") || "_nenhuma_"
}

## Duplicatas de conteúdo

${
  duplicates.length
    ? duplicates.map((d) => `- ${d.name} = ${d.duplicate_of} (\`${d.file}\`)`).join("\n")
    : "_nenhuma registrada nesta execução (ver hashes iguais no manifest)_"
}

## Nomes sem correspondência

${missing.length ? missing.map((n) => `- ${n}`).join("\n") : "_nenhum_"}

## Falhas

Ver \`output/metadata/errors.json\` (${errors.length} entradas).

## Estrutura resultante

\`\`\`text
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
\`\`\`

## Recomendações para o storage do Tervelo

1. **Não** usar hotlink de gifdotreino.com em produção.
2. Fazer upload dos arquivos de \`output/gifs/\` para o bucket Nhost \`exercise-media\`.
3. Persistir \`file_id\` em \`exercise_media\` ligado ao canônico/variante correspondente.
4. Mapear \`manifest.json\` (name/slug/category) para \`canonical_exercises\` / aliases — nomes do site não são 1:1 com o seed Tervelo.
5. Preferir WebM/MP4 no app no futuro; nesta etapa os GIFs permanecem intactos.
6. Não commitar os binários no git (~3 GB). Versionar só metadata + este relatório.
7. Só fazer o upload depois de revisar este relatório.

## Validação

- Probe de 5 GIFs: magia GIF89a, 1080×1080, 0 falhas.
- Playwright headless: 20 botões Visualizar na primeira página; modal \`#modal-gif\` / \`#modal-name\` / \`#close-modal\` ok. Headed não rodou neste ambiente (sem display).
- Arquivos em disco: 962 GIFs válidos; 1 nome extra aponta para o mesmo SHA-256.

## Não feito nesta etapa

- Upload para Nhost Storage / Hasura
- Seed SQL de exercícios
- Conversão ou recompressão
`;
  await fs.writeFile(path.join(OUT, "MIGRATION_REPORT.md"), md, "utf8");
  await fs.writeFile(path.join(__dirname, "MIGRATION_REPORT.md"), md, "utf8");
}

async function restoreManifest() {
  if (FRESH) return;
  const file = path.join(META_DIR, "manifest.json");
  if (!fssync.existsSync(file)) return;
  try {
    const prev = JSON.parse(await fs.readFile(file, "utf8"));
    if (!Array.isArray(prev)) return;
    for (const item of prev) {
      const full = path.join(OUT, item.file || "");
      if (!item.sha256 || !fssync.existsSync(full)) continue;
      manifest.push(item);
      if (!byHash.has(item.sha256)) byHash.set(item.sha256, item);
      if (item.source_url) seenUrls.add(item.source_url);
      if (String(item.origin || "").includes("duplicate")) {
        const original = manifest.find(
          (row) => row.sha256 === item.sha256 && row.name !== item.name,
        );
        duplicates.push({
          name: item.name,
          duplicate_of: original?.name || item.name,
          sha256: item.sha256,
          file: item.file,
        });
      }
    }
    console.log(`Retomando ${manifest.length} GIFs já baixados.`);
  } catch (e) {
    console.warn("Não retomou manifest anterior:", String(e));
  }
}

async function downloadCatalogItems(catalog) {
  const pending = catalog.filter((item) => {
    const url = absoluteFromSite(item.path);
    return !seenUrls.has(url) && !manifest.some((m) => m.name === item.name);
  });
  console.log(`Baixando ${pending.length} GIFs (${CONCURRENCY} em paralelo)…`);
  let done = 0;
  await mapPool(pending, CONCURRENCY, async (item) => {
    const url = absoluteFromSite(item.path);
    const category = categoryFromPath(item.path);
    await downloadUrl(url, { name: item.name, category, origin: "catalog-api" });
    done += 1;
    if (done % 20 === 0 || done === pending.length) {
      console.log(`  progresso download ${done}/${pending.length} (salvos ${manifest.length})`);
      await writeMetadata(catalog);
    }
  });
}

async function runBrowserValidation(catalog) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: SLOW,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "pt-BR",
    userAgent: UA,
  });
  const page = await context.newPage();
  page.on("response", async (response) => {
    try {
      const headers = await response.allHeaders();
      const ct = headers["content-type"] || "";
      const url = response.url();
      if (looksLikeGif(url, ct))
        networkGifs.push({ url, contentType: ct, status: response.status() });
    } catch {
      /* ignore */
    }
  });

  console.log(`Abrindo ${START_URL} (Playwright)`);
  await page.goto(START_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.writeFile(path.join(LOG_DIR, "page.html"), await page.content(), "utf8");

  const sample = LIMIT || 5;
  const buttons = page.getByRole("button", { name: /visualizar/i });
  const count = await buttons.count();
  console.log(`Botões Visualizar visíveis: ${count}`);

  const n = Math.min(sample, count);
  for (let i = 0; i < n; i++) {
    const button = buttons.nth(i);
    try {
      await button.scrollIntoViewIfNeeded();
      await button.click({ timeout: 8000 });
      await page.waitForTimeout(700);
    } catch (e) {
      errors.push({ name: `visualizar#${i}`, error: `click: ${String(e)}` });
      continue;
    }
    const title = (
      (await page
        .locator("#modal-name")
        .textContent()
        .catch(() => "")) || ""
    ).trim();
    const src = await page
      .locator("#modal-gif")
      .getAttribute("src")
      .catch(() => "");
    if (src) {
      const url = src.startsWith("http") ? src : absoluteFromSite(src);
      await downloadUrl(url, {
        name: title || catalog[i]?.name || `exercicio-${i + 1}`,
        category: categoryFromPath(src),
        origin: "browser-modal",
      });
    } else {
      errors.push({
        name: title || `visualizar#${i}`,
        error: "GIF não identificado no modal (#modal-gif)",
      });
    }
    const closer = page.locator("#close-modal");
    try {
      if (await closer.isVisible({ timeout: 400 })) await closer.click({ timeout: 1200 });
      else await page.keyboard.press("Escape");
    } catch {
      try {
        await page.keyboard.press("Escape");
      } catch {
        /* ignore */
      }
    }
    await page.waitForTimeout(150);
  }

  await browser.close();
}

async function runBrowserFull() {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: !HEADED,
    slowMo: SLOW,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "pt-BR",
    userAgent: UA,
  });
  const page = await context.newPage();
  page.on("response", async (response) => {
    try {
      const headers = await response.allHeaders();
      const ct = headers["content-type"] || "";
      const url = response.url();
      if (looksLikeGif(url, ct))
        networkGifs.push({ url, contentType: ct, status: response.status() });
    } catch {
      /* ignore */
    }
  });

  console.log(`Abrindo ${START_URL} (Playwright biblioteca)`);
  await page.goto(START_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  let previous = 0;
  for (let i = 0; i < 400; i++) {
    const count = await page.locator(".gif-item").count();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    if (count === previous && i > 3) break;
    previous = count;
    if (LIMIT && count >= LIMIT) break;
  }

  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.writeFile(path.join(LOG_DIR, "page.html"), await page.content(), "utf8");

  const cards = await page.evaluate(() => {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    return [...document.querySelectorAll(".gif-item")].map((card) => {
      const img = card.querySelector("img");
      const name = clean(card.querySelector("p, h2, h3, .name")?.textContent) || clean(img?.alt);
      return {
        title: name,
        src: img?.currentSrc || img?.src || "",
      };
    });
  });

  const unique = cards.filter(
    (c, i, a) => c.title && a.findIndex((x) => x.title === c.title) === i,
  );
  const list = LIMIT ? unique.slice(0, LIMIT) : unique;
  console.log(`Cartões .gif-item: ${list.length}`);

  for (let i = 0; i < list.length; i++) {
    const card = list[i];
    console.log(`\n[${i + 1}/${list.length}] ${card.title}`);
    const button = page
      .locator(".gif-item")
      .filter({ hasText: card.title })
      .getByRole("button", { name: /visualizar/i })
      .first();
    try {
      await button.scrollIntoViewIfNeeded();
      await button.click({ timeout: 8000 });
      await page.waitForTimeout(700);
    } catch (e) {
      errors.push({ name: card.title, error: `click: ${String(e)}` });
    }
    const title = (
      (await page
        .locator("#modal-name")
        .textContent()
        .catch(() => "")) || card.title
    ).trim();
    const src =
      (await page
        .locator("#modal-gif")
        .getAttribute("src")
        .catch(() => "")) || card.src;
    if (src) {
      const url = src.startsWith("http") ? src : absoluteFromSite(src);
      await downloadUrl(url, {
        name: title,
        category: categoryFromPath(src),
        origin: "browser-modal",
      });
    } else {
      errors.push({
        name: title,
        error: "GIF não identificado no DOM/rede após abrir o exercício",
      });
    }
    try {
      const closer = page.locator("#close-modal");
      if (await closer.isVisible({ timeout: 400 })) await closer.click({ timeout: 1200 });
      else await page.keyboard.press("Escape");
    } catch {
      try {
        await page.keyboard.press("Escape");
      } catch {
        /* ignore */
      }
    }
    await page.waitForTimeout(150);
  }

  await browser.close();
  return list.map((c) => ({ name: c.title, path: c.src }));
}

async function main() {
  await Promise.all([
    fs.mkdir(GIF_DIR, { recursive: true }),
    fs.mkdir(META_DIR, { recursive: true }),
    fs.mkdir(LOG_DIR, { recursive: true }),
  ]);
  await restoreManifest();

  console.log(`Abrindo catálogo ${START_URL}`);
  const folders = await fetchFolders();
  console.log(`Pastas: ${folders.join(", ") || "(nenhuma)"}`);
  const catalog = await fetchCatalog();
  console.log(`Exercícios identificados: ${catalog.length}`);
  await writeMetadata(catalog);

  if (DRY) {
    await writeReport(catalog);
    console.log("Modo --dry-catalog: sem download de GIF.");
    return;
  }

  if (BROWSER && process.argv.includes("--browser-full")) {
    await runBrowserFull();
  } else {
    await downloadCatalogItems(catalog);
    if (BROWSER) {
      try {
        await runBrowserValidation(catalog);
      } catch (e) {
        errors.push({ url: START_URL, error: `playwright: ${String(e)}` });
        console.warn("Validação Playwright falhou:", String(e));
      }
    }
  }

  await writeMetadata(catalog);
  await writeReport(catalog);

  console.log("\n==============================");
  console.log(`Exercícios identificados: ${catalog.length}`);
  console.log(`Nomes no manifest: ${manifest.length}`);
  console.log(`GIFs únicos (SHA-256): ${new Set(manifest.map((x) => x.sha256)).size}`);
  console.log(`Falhas/avisos: ${errors.length}`);
  console.log(`Saída: ${OUT}`);
  console.log("==============================");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
