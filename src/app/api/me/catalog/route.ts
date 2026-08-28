import { NextResponse } from "next/server";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { ATHLETE_QUERIES } from "@/lib/athlete/queries";
import { mapCatalogExercises, mapCatalogEquipment, type CatalogGraphql } from "@/lib/athlete/map-catalog";
import { presentCatalogExercises } from "@/lib/catalog/authorized-library";
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
  const nhost = result.ok ? result.data : EMPTY;
  const exercises = presentCatalogExercises(mapCatalogExercises(nhost));
  const equipment = result.ok ? mapCatalogEquipment(result.data) : [];
  return NextResponse.json({
    ok: true,
    data: { exercises, equipment },
    library: true,
    disconnected: !result.ok && result.reason === "nhost_unavailable",
  });
}
