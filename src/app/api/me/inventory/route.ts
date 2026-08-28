import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAthleteSession } from "@/lib/athlete/require-session";
import { disconnectedOrFail, graphqlFailure } from "@/lib/admin/require-session";
import { ATHLETE_QUERIES } from "@/lib/athlete/queries";
import { runGraphqlAsUser } from "@/lib/nhost/graphql-server";

type InventoryGraphql = {
  gyms: { id: string; name: string; notes: string | null }[];
  gym_plates: { id: string; gym_id: string; weight_kg: number | string; quantity: number }[];
  gym_bars: {
    id: string;
    gym_id: string;
    name: string;
    bar_kind: string;
    actual_weight_kg: number | string;
    quantity: number;
  }[];
  gym_dumbbell_sets: {
    id: string;
    gym_id: string;
    weights_kg: number[] | string | null;
    min_kg: number | string | null;
    max_kg: number | string | null;
    increment_kg: number | string | null;
  }[];
  gym_equipment: {
    id: string;
    gym_id: string;
    equipment_id: string;
    quantity: number;
    notes: string | null;
    is_available: boolean;
  }[];
};

const EMPTY: InventoryGraphql = {
  gyms: [],
  gym_plates: [],
  gym_bars: [],
  gym_dumbbell_sets: [],
  gym_equipment: [],
};

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET() {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const result = await runGraphqlAsUser<InventoryGraphql>(
    gate.session,
    ATHLETE_QUERIES.inventory,
    {},
  );
  if (!result.ok) return disconnectedOrFail(result, { gyms: [] })!;
  const gyms = result.data.gyms.map((gym) => ({
    id: gym.id,
    name: gym.name,
    notes: gym.notes,
    plates: result.data.gym_plates
      .filter((row) => row.gym_id === gym.id)
      .map((row) => ({
        id: row.id,
        weightKg: toNumber(row.weight_kg),
        quantity: row.quantity,
      })),
    bars: result.data.gym_bars
      .filter((row) => row.gym_id === gym.id)
      .map((row) => ({
        id: row.id,
        name: row.name,
        barKind: row.bar_kind,
        actualWeightKg: toNumber(row.actual_weight_kg),
        quantity: row.quantity,
      })),
    dumbbells: result.data.gym_dumbbell_sets
      .filter((row) => row.gym_id === gym.id)
      .map((row) => ({
        id: row.id,
        weightsKg: row.weights_kg,
        minKg: toNumber(row.min_kg),
        maxKg: toNumber(row.max_kg),
        incrementKg: toNumber(row.increment_kg),
      })),
    equipment: result.data.gym_equipment.filter((row) => row.gym_id === gym.id),
  }));
  return NextResponse.json({ ok: true, data: { gyms } });
}

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("plate"),
    gymId: z.string().uuid(),
    weightKg: z.number().positive().max(100),
    quantity: z.number().int().min(1).max(40),
  }),
  z.object({
    kind: z.literal("bar"),
    gymId: z.string().uuid(),
    name: z.string().trim().min(2).max(80),
    barKind: z.string().trim().min(2).max(40),
    actualWeightKg: z.number().positive().max(80),
    quantity: z.number().int().min(1).max(20),
  }),
  z.object({
    kind: z.literal("equipment"),
    gymId: z.string().uuid(),
    equipmentId: z.string().uuid(),
    quantity: z.number().int().min(1).max(50),
  }),
]);

export async function POST(request: Request) {
  const gate = await requireAthleteSession();
  if (!gate.ok) return gate.response;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const body = parsed.data;
  if (body.kind === "plate") {
    const result = await runGraphqlAsUser(gate.session, ATHLETE_QUERIES.insertPlate, {
      gym_id: body.gymId,
      weight_kg: body.weightKg,
      quantity: body.quantity,
    });
    if (!result.ok) return graphqlFailure(result.reason);
    return NextResponse.json({ ok: true, data: result.data });
  }
  if (body.kind === "bar") {
    const result = await runGraphqlAsUser(gate.session, ATHLETE_QUERIES.insertBar, {
      gym_id: body.gymId,
      name: body.name,
      bar_kind: body.barKind,
      actual_weight_kg: body.actualWeightKg,
      quantity: body.quantity,
    });
    if (!result.ok) return graphqlFailure(result.reason);
    return NextResponse.json({ ok: true, data: result.data });
  }
  const result = await runGraphqlAsUser(gate.session, ATHLETE_QUERIES.insertGymEquipment, {
    gym_id: body.gymId,
    equipment_id: body.equipmentId,
    quantity: body.quantity,
  });
  if (!result.ok) return graphqlFailure(result.reason);
  return NextResponse.json({ ok: true, data: result.data });
}
