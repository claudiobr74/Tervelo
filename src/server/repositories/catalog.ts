import "server-only";

import { isLocalNhost } from "@/lib/auth/local-preview";
import type { CatalogExercise } from "@/domain/exercise/search";
import type { CatalogEquipment, PreviewGymInventory } from "@/lib/catalog/preview-catalog";

/**
 * Catálogo de produto vem de `/api/me/catalog` (Hasura). Sem banco, lista vazia.
 */
export function getCatalogExercises(): CatalogExercise[] {
  return [];
}

export function getCatalogEquipment(): CatalogEquipment[] {
  return [];
}

export function getPreviewInventory(): PreviewGymInventory {
  return {
    id: "",
    name: "",
    registeredPercent: 0,
    plates: [],
    bars: [],
    dumbbells: { mode: "range", minKg: 0, maxKg: 0, incrementKg: 0 },
    chestEquipment: [],
  };
}

export function usesLocalCatalog(): boolean {
  return isLocalNhost();
}
