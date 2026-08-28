"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminQuery } from "@/lib/admin/use-admin-query";

type NutritionData = {
  nutrition_profiles: {
    id: string;
    user_id: string;
    routine: string | null;
    restrictions: string | null;
    hydration_notes: string | null;
    updated_at: string;
  }[];
  nutrition_targets: {
    id: string;
    user_id: string;
    valid_from: string;
    energy_kcal: number | null;
    protein_g: number | null;
    carbohydrate_g: number | null;
    fat_g: number | null;
    fluid_ml: number | null;
  }[];
};

export function AdminNutritionScreen() {
  const { loading, data, error } = useAdminQuery<NutritionData>("/api/admin/nutrition");
  const profiles = data?.nutrition_profiles ?? [];
  const targets = data?.nutrition_targets ?? [];

  return (
    <AdminShell
      active="Nutrição"
      title="Nutrição"
      subtitle="Perfis e alvos nutricionais reais. Sem check-in, os números ficam vazios."
    >
      <div className="flex flex-col gap-6">
        <AdminStatusPanel
          loading={loading}
          error={error}
          empty={!loading && !error && profiles.length === 0 && targets.length === 0}
          emptyTitle="Nenhuma nutrição no banco"
          emptyBody="nutrition_profiles e nutrition_targets só listam o que o atleta gravou."
        />
        {profiles.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-bold">Perfis</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {profiles.map((profile) => (
                <li key={profile.id}>
                  <p className="font-semibold">{profile.routine || "Rotina não informada"}</p>
                  <p className="text-muted">
                    {profile.restrictions || "Sem restrições registradas"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {targets.length > 0 ? (
          <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
            <h2 className="text-base font-bold">Alvos</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {targets.map((target) => (
                <li key={target.id} className="flex flex-wrap gap-3">
                  <span>desde {target.valid_from}</span>
                  <span>{target.energy_kcal ?? "—"} kcal</span>
                  <span>{target.protein_g ?? "—"} g proteína</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
