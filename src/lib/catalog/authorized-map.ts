import path from "node:path";
import type { CatalogExercise } from "@/domain/exercise/search";

export type AuthorizedExercise = {
  name: string;
  slug: string;
  category: string;
  pattern_slug: string | null;
  gif_file: string | null;
  description_text: string;
  description_status: string;
};

export type AdminLibraryExercise = {
  id: string;
  namePt: string;
  description: string | null;
  movementPatternId: string | null;
  movementPattern: string;
  aliases: string[];
  imageSrc?: string;
  category?: string;
};

const PATTERN_LABELS: Record<string, string> = {
  horizontal_push: "Empurrar horizontal",
  vertical_push: "Empurrar vertical",
  horizontal_pull: "Puxar horizontal",
  vertical_pull: "Puxar vertical",
  squat: "Agachar",
  hinge: "Dobrar o quadril",
  lunge: "Avanço",
  carry: "Carregar",
  rotation: "Rotação",
  isolation: "Isolamento",
};

export const GIF_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeGifSlug(slug: string): boolean {
  return GIF_SLUG_RE.test(slug) && slug.length > 0 && slug.length <= 160;
}

export function gifMediaPath(slug: string): string {
  return `/api/catalog/gif/${encodeURIComponent(slug)}`;
}

export function patternLabel(slug: string | null | undefined): string {
  if (!slug) return "";
  return PATTERN_LABELS[slug] ?? slug;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function toCatalogExercise(item: AuthorizedExercise): CatalogExercise {
  return {
    id: `gdt-${item.slug}`,
    namePt: item.name,
    description: item.description_text || "",
    primaryMuscle: item.category,
    secondaryMuscles: [],
    equipmentName: "",
    movementPattern: patternLabel(item.pattern_slug),
    aliases: item.category ? [item.category] : [],
    imageSrc: item.gif_file ? gifMediaPath(item.slug) : undefined,
  };
}

export function toAdminExercise(item: AuthorizedExercise): AdminLibraryExercise {
  return {
    id: `gdt-${item.slug}`,
    namePt: item.name,
    description: item.description_text || null,
    movementPatternId: null,
    movementPattern: patternLabel(item.pattern_slug),
    aliases: item.category ? [item.category] : [],
    imageSrc: item.gif_file ? gifMediaPath(item.slug) : undefined,
    category: item.category,
  };
}

export function overlayAuthorizedRow(
  exercise: CatalogExercise,
  row: AuthorizedExercise | undefined,
): CatalogExercise {
  if (!row) return exercise;
  return {
    ...exercise,
    description: exercise.description || row.description_text || "",
    primaryMuscle: exercise.primaryMuscle || row.category,
    movementPattern: exercise.movementPattern || patternLabel(row.pattern_slug),
    imageSrc: row.gif_file ? gifMediaPath(row.slug) : exercise.imageSrc,
    aliases: unique([...(exercise.aliases ?? []), row.category]),
  };
}

export function mergeAuthorizedCatalog(
  nhost: CatalogExercise[],
  authorized: AuthorizedExercise[],
): CatalogExercise[] {
  const byName = new Map(authorized.map((item) => [item.name, item]));
  const used = new Set<string>();
  const fromNhost = nhost.map((exercise) => {
    used.add(exercise.namePt);
    return overlayAuthorizedRow(exercise, byName.get(exercise.namePt));
  });
  const extra = authorized
    .filter((item) => !used.has(item.name))
    .map(toCatalogExercise);
  return [...fromNhost, ...extra];
}

export function mergeAdminLibrary(
  nhost: AdminLibraryExercise[],
  authorized: AuthorizedExercise[],
): AdminLibraryExercise[] {
  const byName = new Map(authorized.map((item) => [item.name, item]));
  const used = new Set<string>();
  const fromNhost = nhost.map((exercise) => {
    used.add(exercise.namePt);
    const row = byName.get(exercise.namePt);
    if (!row) return exercise;
    return {
      ...exercise,
      description: exercise.description || row.description_text || null,
      movementPattern: exercise.movementPattern || patternLabel(row.pattern_slug),
      aliases: unique([...(exercise.aliases ?? []), row.category]),
      imageSrc: row.gif_file ? gifMediaPath(row.slug) : exercise.imageSrc,
      category: exercise.category || row.category,
    };
  });
  const extra = authorized.filter((item) => !used.has(item.name)).map(toAdminExercise);
  return [...fromNhost, ...extra];
}

/** Impede `../` e caminhos absolutos; não verifica se o arquivo existe. */
export function confinedGifPath(root: string, gifFile: string): string | null {
  if (!gifFile || gifFile.includes("\0")) return null;
  if (!gifFile.endsWith(".gif")) return null;
  if (gifFile.startsWith("/") || gifFile.startsWith("\\")) return null;
  if (gifFile.split(/[/\\]/).some((part) => part === ".." || part === "")) return null;
  const resolvedRoot = path.resolve(root);
  const full = path.resolve(resolvedRoot, gifFile);
  if (full !== resolvedRoot && !full.startsWith(resolvedRoot + path.sep)) return null;
  return full;
}
