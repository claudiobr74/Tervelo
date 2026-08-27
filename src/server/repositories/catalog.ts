import "server-only";

import { PREVIEW_EQUIPMENT, PREVIEW_EXERCISES, previewGymInventory } from "@/lib/catalog/preview-catalog";
import { isLocalNhost } from "@/lib/auth/local-preview";
import { demoDataEnabled } from "@/lib/demo-data";
import type { CatalogExercise } from "@/domain/exercise/search";
import type { CatalogEquipment, PreviewGymInventory } from "@/lib/catalog/preview-catalog";

/**
 * Sem `nhost up`, devolve o catálogo de pré-visualização (mesmo conteúdo do seed).
 * Com Nhost remoto, os documents em `src/graphql` entram no cliente gerado (Phase 5+)
 * e o catálogo de demonstração deixa de ser servido.
 */
export function getCatalogExercises(): CatalogExercise[] {
  return demoDataEnabled() ? PREVIEW_EXERCISES : [];
}

export function getCatalogEquipment(): CatalogEquipment[] {
  return demoDataEnabled() ? PREVIEW_EQUIPMENT : [];
}

export function getPreviewInventory(): PreviewGymInventory {
  return previewGymInventory();
}

export function usesLocalCatalog(): boolean {
  return isLocalNhost();
}
