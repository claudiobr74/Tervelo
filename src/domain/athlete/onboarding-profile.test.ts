import { describe, expect, it } from "vitest";
import { athleteProfileInput } from "@/domain/athlete/onboarding-profile";

describe("athleteProfileInput", () => {
  it("converte o rascunho completo", () => {
    const input = athleteProfileInput({
      displayName: "Lucas",
      sex: "male",
      birthDate: "1994-03-12",
      heightCm: "180 cm",
      weightKg: "82,4 kg",
      experience: "6m-2y",
      goal: "hypertrophy",
      days: ["seg", "qua", "sex"],
      sessionMinutes: 75,
      preferredPeriod: "morning",
      mealsPerDay: 4,
      dietPattern: "Vegetariana",
      waterLiters: 3.5,
      usesSupplements: true,
      supplements: "Creatina",
      limitations: "Ombro esquerdo",
    });

    expect(input.birthDate).toBe("1994-03-12");
    expect(input.heightCm).toBe(180);
    expect(input.weightKg).toBe(82.4);
    expect(input.goalType).toBe("hypertrophy");
    expect(input.availability.days).toEqual(["seg", "qua", "sex"]);
    expect(input.availability.sessionMinutes).toBe(75);
    expect(input.limitations).toBe("Ombro esquerdo");
    expect(input.nutrition.routine).toBe("4 refeições por dia");
    expect(input.nutrition.restrictions).toBe("Vegetariana");
    expect(input.nutrition.hydrationNotes).toContain("3,5 litros");
    expect(input.nutrition.hydrationNotes).toContain("Creatina");
  });

  it("descarta valores fora do domínio em vez de gravar lixo", () => {
    const input = athleteProfileInput({
      sex: "outro-qualquer",
      birthDate: "12/03/1994",
      heightCm: "abc",
      weightKg: "9999",
      experience: "sempre",
      goal: "ficar-forte",
      days: ["seg", "lua"],
      preferredPeriod: "madrugada",
      limitations: "   ",
    });

    expect(input.sex).toBeNull();
    expect(input.birthDate).toBeNull();
    expect(input.heightCm).toBeNull();
    expect(input.weightKg).toBeNull();
    expect(input.experienceLevel).toBeNull();
    expect(input.goalType).toBeNull();
    expect(input.availability.days).toEqual(["seg"]);
    expect(input.availability.preferredPeriod).toBeNull();
    expect(input.limitations).toBeNull();
  });

  it("não inventa nota de hidratação sem dados", () => {
    const input = athleteProfileInput({ usesSupplements: false });
    expect(input.nutrition.hydrationNotes).toBeNull();
    expect(input.nutrition.routine).toBeNull();
  });
});
