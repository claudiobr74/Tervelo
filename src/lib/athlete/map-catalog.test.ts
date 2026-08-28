import { describe, expect, it } from "vitest";
import { mapCatalogExercises, type CatalogGraphql } from "./map-catalog";
import { mapWorkouts, todaySessionId, type TrainingGraphql } from "./map-workout";

const emptyCatalog: CatalogGraphql = {
  canonical_exercises: [
    { id: "ex-1", name_pt: "Puxada Alta Aberta", description: null, movement_pattern_id: "p-1" },
  ],
  exercise_aliases: [{ alias: "lat pulldown", locale: "pt", canonical_exercise_id: "ex-1" }],
  movement_patterns: [{ id: "p-1", slug: "vertical_pull", name_pt: "Puxar vertical" }],
  exercise_muscles: [{ exercise_id: "ex-1", muscle_id: "m-1", role: "primary" }],
  muscles: [{ id: "m-1", name_pt: "Latíssimo do dorso" }],
  exercise_variants: [],
  exercise_equipment: [],
  equipment: [],
  equipment_categories: [],
};

describe("mapCatalogExercises", () => {
  it("liga músculo, padrão e alias do banco", () => {
    const [exercise] = mapCatalogExercises(emptyCatalog);
    expect(exercise.namePt).toBe("Puxada Alta Aberta");
    expect(exercise.primaryMuscle).toBe("Latíssimo do dorso");
    expect(exercise.movementPattern).toBe("Puxar vertical");
    expect(exercise.aliases).toContain("lat pulldown");
  });

  it("repassa a descrição do canônico", () => {
    const [exercise] = mapCatalogExercises({
      ...emptyCatalog,
      canonical_exercises: [
        {
          id: "ex-1",
          name_pt: "Agachamento",
          description: "Flexiona joelhos e quadris e volta a ficar de pé.",
          movement_pattern_id: "p-1",
        },
      ],
    });
    expect(exercise.description).toBe("Flexiona joelhos e quadris e volta a ficar de pé.");
  });
});

describe("mapWorkouts", () => {
  const data: TrainingGraphql = {
    training_programs: [
      {
        id: "prog-1",
        title: "Força",
        status: "active",
        started_on: null,
        source: "user",
        updated_at: "2026-08-28T00:00:00.000Z",
      },
    ],
    training_blocks: [{ id: "blk-1", program_id: "prog-1", position: 1, name: "A", intent: "Peito" }],
    training_weeks: [{ id: "wk-1", block_id: "blk-1", week_index: 1, notes: null }],
    training_sessions: [
      {
        id: "ses-1",
        week_id: "wk-1",
        gym_id: null,
        scheduled_at: "2026-08-28T12:00:00.000Z",
        started_at: null,
        completed_at: null,
        status: "planned",
      },
    ],
    session_exercises: [
      {
        id: "se-1",
        session_id: "ses-1",
        position: 1,
        rest_seconds: 90,
        method_kind: "working",
        notes: "Supino Reto com Barra",
        planned_equipment_id: null,
        exercise_variant_id: null,
      },
    ],
    exercise_sets: [
      {
        id: "set-1",
        session_exercise_id: "se-1",
        set_index: 1,
        target_reps_min: 8,
        target_reps_max: 12,
        target_weight_kg: 80,
        target_reps_in_reserve: 2,
      },
    ],
    exercise_variants: [],
    canonical_exercises: [],
  };

  it("monta a sessão com o título do programa e as séries", () => {
    const [workout] = mapWorkouts(data);
    expect(workout.title).toBe("Força");
    expect(workout.focus).toBe("Peito");
    expect(workout.exercises[0]?.namePt).toBe("Supino Reto com Barra");
    expect(workout.exercises[0]?.sets[0]?.targetWeightKg).toBe(80);
  });

  it("escolhe a sessão de hoje", () => {
    expect(todaySessionId(data.training_sessions, new Date("2026-08-28T15:00:00.000Z"))).toBe(
      "ses-1",
    );
    expect(todaySessionId(data.training_sessions, new Date("2026-08-27T15:00:00.000Z"))).toBeNull();
  });
});
