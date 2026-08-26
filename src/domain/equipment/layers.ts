/** Catálogo canônico vs modelo de fabricante vs instância no ginásio. */
export type EquipmentLayer = "canonical" | "model" | "inventory";

export type CanonicalEquipment = {
  layer: "canonical";
  id: string;
  namePt: string;
  categoryId: string;
};

export type EquipmentModel = {
  layer: "model";
  id: string;
  equipmentId: string;
  manufacturerId: string;
  modelName: string;
};

export type GymEquipmentInstance = {
  layer: "inventory";
  id: string;
  gymId: string;
  equipmentId: string;
  equipmentModelId: string | null;
  quantity: number;
  isAvailable: boolean;
};

export function isCatalogWriteRole(role: string): boolean {
  return role === "admin" || role === "super_admin";
}
