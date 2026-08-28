import type { CatalogExercise } from "@/domain/exercise/search";
import type { PlateStock } from "@/domain/plates/calculate";
import { typicalPlateStock } from "@/domain/plates/calculate";
import type { DumbbellSet } from "@/domain/gym/dumbbells";

export type CatalogEquipment = {
  id: string;
  namePt: string;
  category: string;
  muscles: string;
  resistance: string;
  adjustments: string;
  range: string;
  increment: string;
  loadingSystem: string;
  manufacturers: string[];
  imageSrc?: string;
};

export type GymBar = {
  id: string;
  name: string;
  actualWeightKg: number;
  selected: boolean;
};

export type PreviewGymInventory = {
  id: string;
  name: string;
  registeredPercent: number;
  plates: PlateStock[];
  bars: GymBar[];
  dumbbells: DumbbellSet;
  chestEquipment: { id: string; name: string; selected: boolean }[];
};

export const PREVIEW_EXERCISES: CatalogExercise[] = [
  {
    id: "ex-puxada-alta",
    namePt: "Puxada Alta Aberta",
    primaryMuscle: "Latíssimo do dorso",
    secondaryMuscles: ["Bíceps", "Romboides", "Trapézio inferior"],
    equipmentName: "Lat Pulldown",
    movementPattern: "Puxar vertical",
    aliases: ["puxada alta", "lat pulldown", "puxada aberta", "pulldown"],
    favorite: true,
    imageSrc: "/catalog/lat-pulldown.webp",
  },
  {
    id: "ex-puxada-neutra",
    namePt: "Puxada Neutra",
    primaryMuscle: "Latíssimo do dorso",
    secondaryMuscles: ["Bíceps", "Romboides"],
    equipmentName: "Polia",
    movementPattern: "Puxar vertical",
    aliases: ["puxada neutra", "neutral pulldown"],
  },
  {
    id: "ex-puxada-supinada",
    namePt: "Puxada Supinada",
    primaryMuscle: "Bíceps / Costas",
    secondaryMuscles: ["Latíssimo do dorso"],
    equipmentName: "Polia",
    movementPattern: "Puxar vertical",
    aliases: ["puxada supinada", "chin pulldown"],
  },
  {
    id: "ex-puxada-unilateral",
    namePt: "Puxada Unilateral",
    primaryMuscle: "Latíssimo / Romboides",
    secondaryMuscles: ["Bíceps"],
    equipmentName: "Halter",
    movementPattern: "Puxar vertical",
    aliases: ["puxada unilateral", "one arm pulldown"],
  },
  {
    id: "ex-pulldown-convergente",
    namePt: "Pulldown Convergente",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Bíceps"],
    equipmentName: "Máquina",
    movementPattern: "Puxar vertical",
    aliases: ["pulldown convergente", "converging pulldown"],
  },
  {
    id: "ex-straight-arm",
    namePt: "Straight Arm Pulldown",
    primaryMuscle: "Costas",
    secondaryMuscles: ["Latíssimo do dorso", "Tríceps longo"],
    equipmentName: "Cabo",
    movementPattern: "Puxar vertical",
    aliases: ["straight arm pulldown", "puxada braços estendidos", "pulldown"],
    favorite: true,
  },
  {
    id: "ex-supino-reto",
    namePt: "Supino Reto com Barra",
    primaryMuscle: "Peitoral maior",
    secondaryMuscles: ["Deltoide anterior", "Tríceps"],
    equipmentName: "Barra, Banco Reto",
    movementPattern: "Empurrar horizontal",
    aliases: ["supino reto", "bench press", "supino horizontal", "supino com barra"],
    imageSrc: "/catalog/thumb-supino.webp",
  },
  {
    id: "ex-agachamento",
    namePt: "Agachamento Livre",
    primaryMuscle: "Quadríceps",
    secondaryMuscles: ["Glúteos", "Posterior"],
    equipmentName: "Barra",
    movementPattern: "Agachar",
    aliases: ["agachamento", "squat", "agachamento livre"],
    imageSrc: "/catalog/thumb-agachamento.webp",
  },
  {
    id: "ex-desenvolvimento",
    namePt: "Desenvolvimento com Halteres",
    primaryMuscle: "Deltoide",
    secondaryMuscles: ["Tríceps"],
    equipmentName: "Halteres",
    movementPattern: "Empurrar vertical",
    aliases: ["desenvolvimento", "shoulder press", "desenvolvimento com halteres"],
  },
  {
    id: "ex-elevacao-pelvica",
    namePt: "Elevação Pélvica",
    primaryMuscle: "Glúteos",
    secondaryMuscles: ["Posterior", "Core"],
    equipmentName: "Banco",
    movementPattern: "Dobrar o quadril",
    aliases: ["hip thrust", "elevação pélvica"],
  },
  {
    id: "ex-rosca-w",
    namePt: "Rosca Direta com Barra W",
    primaryMuscle: "Bíceps",
    secondaryMuscles: ["Braquial"],
    equipmentName: "Barra W",
    movementPattern: "Isolamento",
    aliases: ["rosca direta", "barbell curl", "rosca barra w"],
  },
];

export const PREVIEW_EQUIPMENT: CatalogEquipment[] = [
  {
    id: "eq-chest-press",
    namePt: "Chest Press Convergente",
    category: "M. Seletorizadas",
    muscles: "Peitoral, Tríceps",
    resistance: "Pilha de pesos",
    adjustments: "3",
    range: "5–150 kg",
    increment: "2,5 kg / 5 kg",
    loadingSystem: "Seletor de pinos magnéticos",
    manufacturers: ["Life Fitness", "Hammer Strength", "Technogym", "Matrix"],
    imageSrc: "/catalog/thumb-supino.webp",
  },
  {
    id: "eq-leg-press",
    namePt: "Leg Press Horizontal",
    category: "M. Seletorizadas",
    muscles: "Quadríceps, Glúteos",
    resistance: "Pilha de pesos",
    adjustments: "4",
    range: "10–200 kg",
    increment: "5 kg",
    loadingSystem: "Seletor de pinos",
    manufacturers: ["Technogym", "Life Fitness"],
    imageSrc: "/catalog/thumb-agachamento.webp",
  },
  {
    id: "eq-mesa-flexora",
    namePt: "Mesa Flexora Seletorizada",
    category: "M. Seletorizadas",
    muscles: "Posterior",
    resistance: "Pilha de pesos",
    adjustments: "2",
    range: "5–100 kg",
    increment: "2,5 kg",
    loadingSystem: "Seletor de pinos",
    manufacturers: ["Life Fitness"],
  },
  {
    id: "eq-pec-deck",
    namePt: "Pec Deck / Posterior",
    category: "M. Seletorizadas",
    muscles: "Peitoral, Deltoide posterior",
    resistance: "Pilha de pesos",
    adjustments: "2",
    range: "5–80 kg",
    increment: "2,5 kg",
    loadingSystem: "Seletor de pinos",
    manufacturers: ["Life Fitness"],
  },
  {
    id: "eq-lat-pulldown",
    namePt: "Lat Pulldown",
    category: "Cabos e Polias",
    muscles: "Latíssimo do dorso",
    resistance: "Pilha de pesos",
    adjustments: "1",
    range: "5–120 kg",
    increment: "5 kg",
    loadingSystem: "Cabo e pinos",
    manufacturers: ["Technogym", "Hammer Strength"],
    imageSrc: "/catalog/thumb-puxada.webp",
  },
];

export const EQUIPMENT_CATEGORIES = [
  "M. Seletorizadas",
  "M. Plate-loaded",
  "Cabos e Polias",
  "Pesos Livres",
  "Racks & Gaiolas",
  "Bancos",
  "Barras",
  "Halteres",
] as const;

export function previewGymInventory(): PreviewGymInventory {
  return {
    id: "gym-a",
    name: "Inventário de exemplo",
    registeredPercent: 0,
    plates: typicalPlateStock().map((item) =>
      item.weightKg === 1.25 ? { ...item, quantity: 0 } : item,
    ),
    bars: [
      { id: "bar-oly-20", name: "Olímpica Masc. (20kg)", actualWeightKg: 20, selected: true },
      { id: "bar-oly-15", name: "Olímpica Fem. (15kg)", actualWeightKg: 15, selected: true },
      { id: "bar-ez", name: "Barra EZ (8kg)", actualWeightKg: 8, selected: true },
      { id: "bar-trap", name: "Trap Bar (25kg)", actualWeightKg: 25, selected: true },
    ],
    dumbbells: { mode: "range", minKg: 2, maxKg: 50, incrementKg: 2 },
    chestEquipment: [
      { id: "eq-chest-press", name: "Chest Press Convergente (Hammer Strength)", selected: true },
      { id: "eq-incline", name: "Supino Inclinado Plate-Loaded (Hammer Strength)", selected: true },
      { id: "eq-crossover", name: "Crossover com Polias Ajustáveis (Technogym)", selected: true },
      { id: "eq-pec-deck", name: "Peck Deck / Fly Seletorizado (Life Fitness)", selected: false },
    ],
  };
}
