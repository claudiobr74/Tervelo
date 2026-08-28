#!/usr/bin/env node
/**
 * Gera nhost/seeds/default/004_gifdotreino_media.sql a partir de exercises.json.
 * Só object_key (caminho local). file_id fica nulo até o upload no bucket.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const META = path.join(__dirname, "output", "metadata");
const SEED = path.join(__dirname, "../../nhost/seeds/default/004_gifdotreino_media.sql");

function sqlIdent(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function buildMediaSeed(exercises) {
  const rows = exercises.filter((item) => item.name && item.gif_file);
  const header = `-- Liga cada canônico ao GIF autorizado (object_key relativo a output/).
-- file_id permanece nulo até o upload no bucket Nhost exercise-media.
-- Sem UNIQUE em object_key: dois nomes podem apontar ao mesmo arquivo.
-- Aplicar depois da migration exercise_media e do seed 003.

`;
  const parts = [];
  for (const batch of chunk(rows, 80)) {
    const values = batch
      .map((row) => `  (${sqlIdent(row.name)}, ${sqlIdent(row.gif_file)})`)
      .join(",\n");
    parts.push(`INSERT INTO public.exercise_media (canonical_exercise_id, kind, object_key, mime_type)
SELECT e.id, 'gif', v.object_key, 'image/gif'
FROM (
  VALUES
${values}
) AS v(name_pt, object_key)
JOIN public.canonical_exercises e ON e.name_pt = v.name_pt
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercise_media m
  WHERE m.canonical_exercise_id = e.id AND m.kind = 'gif'
);
`);
  }
  return `${header}${parts.join("\n")}`;
}

async function main() {
  const exercises = JSON.parse(await fs.readFile(path.join(META, "exercises.json"), "utf8"));
  const seed = buildMediaSeed(exercises);
  await fs.mkdir(path.dirname(SEED), { recursive: true });
  await fs.writeFile(SEED, seed, "utf8");
  const withGif = exercises.filter((item) => item.gif_file).length;
  console.log(
    JSON.stringify({
      total: exercises.length,
      with_gif: withGif,
      seed_bytes: Buffer.byteLength(seed),
      seed: SEED,
    }),
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
