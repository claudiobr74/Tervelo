import { TodayScreen } from "@/components/app/today-screen";
import { getServerAppSession } from "@/lib/auth/session";

export const metadata = { title: "Hoje — TERVELO" };

export default async function TodayPage() {
  const session = await getServerAppSession();
  return <TodayScreen sessionName={session?.user?.displayName ?? null} />;
}
