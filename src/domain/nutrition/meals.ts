export type MealSlot = {
  name: string;
  energyKcal: number;
  proteinG: number;
  carbohydrateG: number;
  time: string;
};

export function sumMealEnergy(meals: readonly MealSlot[]): number {
  return meals.reduce((total, meal) => total + meal.energyKcal, 0);
}
