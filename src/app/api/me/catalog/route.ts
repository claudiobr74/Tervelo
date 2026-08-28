import { NextResponse } from "next/server";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail } from "@/lib/admin/require-session";
import { ATHLETE_QUERIES } from "@/lib/athlete/queries";
import { mapCatalogEquipment, mapCatalogExercises, type CatalogGraphql } from "@/lib/athlete/map-catalog";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

const EMPTY: CatalogGraphql = {
  canonical_exercises: [],
  exercise_aliases: [],
  movement_patterns: [],
  exercise_muscles: [],
  muscles: [],
  exercise_variants: [],
  exercise_equipment: [],
  equipment: [],
  equipment_categories: [],
};

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<CatalogGraphql>(gate.session, ATHLETE_QUERIES.catalog, {});
  if (!result.ok) {
    return disconnectedOrFail(result, { exercises: [], equipment: [] })!;
  }
  return NextResponse.json({
    ok: true,
    data: {
      exercises: mapCatalogExercises(result.data),
      equipment: mapCatalogEquipment(result.data),
    },
  });
}
