import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { CatalogExercise } from "@/domain/exercise/search";
import {
  confinedGifPath,
  isSafeGifSlug,
  mergeAdminLibrary,
  mergeAuthorizedCatalog,
  toAdminExercise,
  toCatalogExercise,
  type AdminLibraryExercise,
  type AuthorizedExercise,
} from "@/lib/catalog/authorized-map";

export type { AdminLibraryExercise, AuthorizedExercise };

const LIBRARY_PATH = path.join(
  process.cwd(),
  "scripts/gifdotreino-downloader/output/metadata/exercises.json",
);
const GIF_ROOT = path.join(process.cwd(), "scripts/gifdotreino-downloader/output");

let cached: AuthorizedExercise[] | null = null;

export function loadAuthorizedExercises(): AuthorizedExercise[] {
  if (cached) return cached;
  if (!fs.existsSync(LIBRARY_PATH)) {
    cached = [];
    return cached;
  }
  const raw = JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf8")) as AuthorizedExercise[];
  cached = Array.isArray(raw) ? raw : [];
  return cached;
}

export function authorizedCatalogExercises(): CatalogExercise[] {
  return loadAuthorizedExercises().map(toCatalogExercise);
}

export function authorizedAdminExercises(): AdminLibraryExercise[] {
  return loadAuthorizedExercises().map(toAdminExercise);
}

export function presentCatalogExercises(nhost: CatalogExercise[]): CatalogExercise[] {
  const library = loadAuthorizedExercises();
  if (library.length === 0) return nhost;
  if (nhost.length === 0) return library.map(toCatalogExercise);
  return mergeAuthorizedCatalog(nhost, library);
}

export function presentAdminExercises(nhost: AdminLibraryExercise[]): AdminLibraryExercise[] {
  const library = loadAuthorizedExercises();
  if (library.length === 0) return nhost;
  if (nhost.length === 0) return library.map(toAdminExercise);
  return mergeAdminLibrary(nhost, library);
}

export function authorizedGifObjectKey(slug: string): string | null {
  if (!isSafeGifSlug(slug)) return null;
  const row = loadAuthorizedExercises().find((item) => item.slug === slug);
  return row?.gif_file || null;
}

export function resolveAuthorizedGifFile(slug: string): string | null {
  const objectKey = authorizedGifObjectKey(slug);
  if (!objectKey) return null;
  const full = confinedGifPath(GIF_ROOT, objectKey);
  if (!full) return null;
  return fs.existsSync(full) ? full : null;
}
