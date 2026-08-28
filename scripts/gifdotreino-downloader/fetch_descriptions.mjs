#!/usr/bin/env node
/**
 * Baixa as fichas reais em Descrição/{nome}.txt (o search_gifs.php só manda placeholder),
 * limpa o HTML e gera JSON + seed SQL de canonical_exercises.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { categoryFromPath, slugify } from "./download_gifdotreino.mjs";
import { htmlToPlainText, PATTERN_BY_FOLDER } from "./description-text.mjs";
import { buildMediaSeed } from "./generate_media_seed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const START_URL = "https://www.gifdotreino.com/";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
const META = path.join(__dirname, "output", "metadata");
const SEED = path.join(__dirname, "../../nhost/seeds/default/003_gifdotreino_exercises.sql");
const MEDIA_SEED = path.join(__dirname, "../../nhost/seeds/default/004_gifdotreino_media.sql");
const CONCURRENCY = 8;

function descriptionUrl(name) {
  const encoded = ["Descrição", `${name}.txt`].map(encodeURIComponent).join("/");
  return new URL(encoded, START_URL).href;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Referer: START_URL, Accept: "text/plain,text/html,*/*" },
  });
  if (res.status === 404) return { ok: false, status: 404, text: "" };
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return { ok: true, status: res.status, text: await res.text() };
}

async function mapPool(items, n, fn) {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, Math.max(items.length, 1)) }, () => worker()));
}

function sqlStringTag(text) {
  for (const tag of ["gdt", "gdt1", "gdt2", "desc"]) {
    const wrap = `$${tag}$`;
    if (!text.includes(wrap)) return wrap;
  }
  throw new Error("não achou delimiter dollar-quote");
}

function sqlText(value) {
  if (value == null || value === "") return "NULL";
  const tag = sqlStringTag(value);
  return `${tag}${value}${tag}`;
}

function sqlIdent(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildSeed(exercises) {
  const rows = exercises.map((item) => ({
    name: item.name,
    description: item.description_text || "",
    pattern: item.pattern_slug || "",
    alias: item.category && item.category !== item.name ? item.category : "",
  }));

  const header = `-- Biblioteca Gif do Treino (autorizada): nome + descrição em texto.
-- Fonte: Descrição/{nome}.txt em gifdotreino.com. Sem hotlink, sem mídia.
-- Idempotente por name_pt. Aplicar depois de 001_catalog.sql e 002_exercises_equipment.sql.

`;

  const updateParts = [];
  const insertParts = [];
  const aliasParts = [];

  for (const [index, batch] of chunk(rows, 80).entries()) {
    const values = batch
      .map(
        (row) =>
          `  (${sqlIdent(row.name)}, ${sqlText(row.description)}, ${row.pattern ? sqlIdent(row.pattern) : "NULL"})`,
      )
      .join(",\n");
    updateParts.push(`UPDATE public.canonical_exercises AS e
SET
  description = NULLIF(v.description, ''),
  movement_pattern_id = COALESCE(e.movement_pattern_id, p.id),
  updated_at = now()
FROM (
  VALUES
${values}
) AS v(name_pt, description, pattern_slug)
LEFT JOIN public.movement_patterns p ON p.slug = v.pattern_slug
WHERE e.name_pt = v.name_pt;
`);
    insertParts.push(`INSERT INTO public.canonical_exercises (name_pt, description, movement_pattern_id)
SELECT v.name_pt, NULLIF(v.description, ''), p.id
FROM (
  VALUES
${values}
) AS v(name_pt, description, pattern_slug)
LEFT JOIN public.movement_patterns p ON p.slug = v.pattern_slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.canonical_exercises e WHERE e.name_pt = v.name_pt
);
`);
    const aliasValues = batch
      .filter((row) => row.alias)
      .map((row) => `  (${sqlIdent(row.name)}, ${sqlIdent(row.alias)})`)
      .join(",\n");
    if (aliasValues) {
      aliasParts.push(`INSERT INTO public.exercise_aliases (canonical_exercise_id, alias, locale)
SELECT e.id, v.alias, 'pt'
FROM (
  VALUES
${aliasValues}
) AS v(name_pt, alias)
JOIN public.canonical_exercises e ON e.name_pt = v.name_pt
ON CONFLICT DO NOTHING;
`);
    }
    void index;
  }

  return `${header}${updateParts.join("\n")}\n${insertParts.join("\n")}\n${aliasParts.join("\n")}`;
}

async function main() {
  const catalog = JSON.parse(await fs.readFile(path.join(META, "catalog.json"), "utf8"));
  const manifest = JSON.parse(await fs.readFile(path.join(META, "manifest.json"), "utf8"));
  const byName = new Map(manifest.map((item) => [item.name, item]));
  const outPath = path.join(META, "exercises.json");
  let previous = [];
  try {
    previous = JSON.parse(await fs.readFile(outPath, "utf8"));
  } catch {
    previous = [];
  }
  const prevByName = new Map(previous.map((item) => [item.name, item]));

  const exercises = catalog.map((item) => {
    const file = byName.get(item.name);
    const category = file?.category || categoryFromPath(item.path);
    return {
      name: item.name,
      slug: slugify(item.name),
      category,
      pattern_slug: PATTERN_BY_FOLDER[category] ?? null,
      gif_file: file?.file ?? null,
      source_gif: file?.source_url ?? new URL(item.path.split("/").map(encodeURIComponent).join("/"), START_URL).href,
      source_description: descriptionUrl(item.name),
      description_text: prevByName.get(item.name)?.description_text ?? "",
      description_status: prevByName.get(item.name)?.description_status ?? "pending",
    };
  });

  const pending = exercises.filter((item) => item.description_status === "pending");
  console.log(`Fichas: ${exercises.length}. Pendentes: ${pending.length}.`);

  let done = 0;
  await mapPool(pending, CONCURRENCY, async (item) => {
    try {
      const result = await fetchText(item.source_description);
      if (!result.ok) {
        item.description_status = "missing";
        item.description_text = "";
      } else {
        item.description_text = htmlToPlainText(result.text);
        item.description_status = item.description_text ? "ok" : "empty";
      }
    } catch (error) {
      item.description_status = "error";
      item.description_error = String(error);
      console.error(`✗ ${item.name}: ${error}`);
    }
    done += 1;
    if (done % 40 === 0 || done === pending.length) {
      console.log(`  descrições ${done}/${pending.length}`);
      await fs.writeFile(outPath, JSON.stringify(exercises, null, 2), "utf8");
    }
  });

  await fs.writeFile(outPath, JSON.stringify(exercises, null, 2), "utf8");
  const seed = buildSeed(exercises);
  const mediaSeed = buildMediaSeed(exercises);
  await fs.mkdir(path.dirname(SEED), { recursive: true });
  await fs.writeFile(SEED, seed, "utf8");
  await fs.writeFile(MEDIA_SEED, mediaSeed, "utf8");

  const stats = {
    total: exercises.length,
    ok: exercises.filter((item) => item.description_status === "ok").length,
    missing: exercises.filter((item) => item.description_status === "missing").length,
    empty: exercises.filter((item) => item.description_status === "empty").length,
    error: exercises.filter((item) => item.description_status === "error").length,
    with_pattern: exercises.filter((item) => item.pattern_slug).length,
    seed_bytes: Buffer.byteLength(seed),
    media_seed_bytes: Buffer.byteLength(mediaSeed),
  };
  await fs.writeFile(path.join(META, "descriptions-stats.json"), JSON.stringify(stats, null, 2), "utf8");
  console.log(JSON.stringify(stats, null, 2));
  console.log(`Seed: ${SEED}`);
  console.log(`Media seed: ${MEDIA_SEED}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
