import { ProfileScreen } from "@/components/app/profile-screen";
import { getServerAppSession } from "@/lib/auth/session";

export const metadata = { title: "Mais — TERVELO" };

export default async function ProfilePage() {
  const session = await getServerAppSession();
  return <ProfileScreen sessionName={session?.user?.displayName ?? null} />;
}
