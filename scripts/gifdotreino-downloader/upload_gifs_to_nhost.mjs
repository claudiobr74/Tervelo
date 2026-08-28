#!/usr/bin/env node
/**
 * Envia os GIFs autorizados ao bucket Nhost `exercise-media`.
 * Não commita bytes. Idempotente: pula arquivo cujo `name` já existe.
 *
 * Env (`.env.local` na raiz):
 *   NEXT_PUBLIC_NHOST_SUBDOMAIN
 *   NEXT_PUBLIC_NHOST_REGION
 *   NHOST_ADMIN_SECRET
 *   NHOST_ACCESS_TOKEN  (opcional; JWT de um admin se o storage recusar o secret)
 *
 *   npm run catalog:gifs:upload -- --limit 3
 *   npm run catalog:gifs:upload
 */

import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const META = path.join(__dirname, "output", "metadata", "exercises.json");
const GIF_ROOT = path.join(__dirname, "output");
const BUCKET = "exercise-media";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

async function graphql(endpoint, headers, query, variables) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (!response.ok || json.errors?.length) {
    const message = (json.errors ?? []).map((error) => error.message).join("; ") || response.status;
    throw new Error(String(message));
  }
  return json.data;
}

async function existingFileId(graphqlUrl, headers, name) {
  const data = await graphql(
    graphqlUrl,
    headers,
    `query CatalogGifFile($name: String!) {
      files(
        where: { _and: [{ bucketId: { _eq: "${BUCKET}" } }, { name: { _eq: $name } }] }
        limit: 1
      ) { id }
    }`,
    { name },
  );
  return data.files?.[0]?.id ?? null;
}

async function uploadOne(storageUrl, headers, objectKey, bytes) {
  const form = new FormData();
  form.append("bucket-id", BUCKET);
  form.append(
    "metadata[]",
    new Blob([JSON.stringify({ name: objectKey })], { type: "application/json" }),
  );
  form.append("file[]", new Blob([bytes], { type: "image/gif" }), objectKey);
  const response = await fetch(`${storageUrl}/files`, { method: "POST", headers, body: form });
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`storage ${response.status}: ${text.slice(0, 300)}`);
  }
  const id = body.processedFiles?.[0]?.id ?? body.fileMetadata?.id ?? null;
  if (!id) throw new Error(`upload sem file id: ${text.slice(0, 300)}`);
  return id;
}

async function linkMedia(graphqlUrl, headers, objectKey, fileId) {
  try {
    await graphql(
      graphqlUrl,
      headers,
      `
        mutation CatalogGifLink($object_key: String!, $file_id: uuid!) {
          update_exercise_media(
            where: { object_key: { _eq: $object_key } }
            _set: { file_id: $file_id }
          ) {
            affected_rows
          }
        }
      `,
      { object_key: objectKey, file_id: fileId },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/exercise_media|field/i.test(message)) return;
    throw error;
  }
}

async function mapPool(items, concurrency, fn) {
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current], current);
    }
  });
  await Promise.all(workers);
}

async function main() {
  loadEnvFile(path.join(ROOT, ".env.local"));
  loadEnvFile(path.join(ROOT, ".env"));

  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION;
  const secret = process.env.NHOST_ADMIN_SECRET;
  const accessToken = process.env.NHOST_ACCESS_TOKEN;
  if (!subdomain || subdomain === "local" || !region || region === "local") {
    console.error("Defina NEXT_PUBLIC_NHOST_SUBDOMAIN e NEXT_PUBLIC_NHOST_REGION no .env.local.");
    process.exit(1);
  }
  if (!secret && !accessToken) {
    console.error("Defina NHOST_ADMIN_SECRET (dashboard Nhost) ou NHOST_ACCESS_TOKEN de um admin.");
    process.exit(1);
  }
  if (!existsSync(META)) {
    console.error("Falta exercises.json. Rode npm run catalog:descriptions.");
    process.exit(1);
  }

  const graphqlUrl = `https://${subdomain}.graphql.${region}.nhost.run/v1`;
  const storageUrl = `https://${subdomain}.storage.${region}.nhost.run/v1`;
  const graphqlHeaders = secret
    ? { "x-hasura-admin-secret": secret }
    : { Authorization: `Bearer ${accessToken}` };
  const storageHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : { "x-hasura-admin-secret": secret };

  const exercises = JSON.parse(await readFile(META, "utf8"));
  const unique = new Map();
  for (const row of exercises) {
    if (row.gif_file && !unique.has(row.gif_file)) unique.set(row.gif_file, row);
  }
  let items = [...unique.keys()];
  const limit = Number(argValue("--limit", "0"));
  if (limit > 0) items = items.slice(0, limit);
  const concurrency = Math.max(1, Number(argValue("--concurrency", "2")));
  const dry = hasFlag("--dry-run");

  console.log(
    JSON.stringify({
      bucket: BUCKET,
      unique_gifs: items.length,
      concurrency,
      dry_run: dry,
    }),
  );

  const summary = { uploaded: 0, skipped: 0, missing_local: 0, failed: 0 };
  await mapPool(items, dry ? 1 : concurrency, async (objectKey) => {
    const full = path.join(GIF_ROOT, objectKey);
    if (!existsSync(full)) {
      summary.missing_local += 1;
      console.warn("faltando", objectKey);
      return;
    }
    if (dry) {
      console.log("ok", objectKey);
      return;
    }
    try {
      const already = await existingFileId(graphqlUrl, graphqlHeaders, objectKey);
      if (already) {
        await linkMedia(graphqlUrl, graphqlHeaders, objectKey, already);
        summary.skipped += 1;
        return;
      }
      const bytes = await readFile(full);
      const fileId = await uploadOne(storageUrl, storageHeaders, objectKey, bytes);
      await linkMedia(graphqlUrl, graphqlHeaders, objectKey, fileId);
      summary.uploaded += 1;
      if ((summary.uploaded + summary.skipped) % 25 === 0) {
        console.log("progresso", summary);
      }
    } catch (error) {
      summary.failed += 1;
      console.error("falhou", objectKey, error instanceof Error ? error.message : error);
    }
  });
  console.log(JSON.stringify(summary));
  if (summary.failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
