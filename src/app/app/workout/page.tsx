import { Suspense } from "react";
import { WorkoutSessionScreen } from "@/components/app/workout-session-screen";

export const metadata = { title: "Sessão de treino — TERVELO" };

export default function WorkoutPage() {
  return (
    <Suspense>
      <WorkoutSessionScreen />
    </Suspense>
  );
}
