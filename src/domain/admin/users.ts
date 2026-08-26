export type AdminUserStatus = "Ativo" | "Inativo";

export type AdminUser = {
  id: string;
  name: string;
  avatar: string;
  status: AdminUserStatus;
  plan: string;
  goal: string;
  lastWorkout: string;
  adherencePct: number;
  lastActivity: string;
};

export type AdminUserFilters = {
  query: string;
  status: "Todos" | AdminUserStatus;
  plan: "Todos" | string;
  goal: "Todos" | string;
};

export function adherenceTone(percent: number): "success" | "brand" | "error" {
  if (percent >= 80) return "success";
  if (percent >= 50) return "brand";
  return "error";
}

export function filterAdminUsers(users: readonly AdminUser[], filters: AdminUserFilters): AdminUser[] {
  const query = filters.query.trim().toLocaleLowerCase("pt-BR");
  return users.filter((user) => {
    if (query && !user.name.toLocaleLowerCase("pt-BR").includes(query)) return false;
    if (filters.status !== "Todos" && user.status !== filters.status) return false;
    if (filters.plan !== "Todos" && user.plan !== filters.plan) return false;
    if (filters.goal !== "Todos" && user.goal !== filters.goal) return false;
    return true;
  });
}

export function formatThousands(value: number): string {
  return value.toLocaleString("pt-BR");
}
