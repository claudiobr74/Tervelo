import { isLocalNhost } from "@/lib/auth/local-preview";

/**
 * Catálogo de exercícios/equipamentos de exemplo, só sem backend.
 * Não inclui pessoa, treino prescrito, medida nem refeição.
 */
export function catalogDemoEnabled(): boolean {
  return isLocalNhost();
}

/**
 * Nunca inventa atleta, treino do dia, nutrição, evolução ou lista de usuários.
 * Quem não existe no backend não aparece na interface.
 */
export function demoDataEnabled(): boolean {
  return false;
}
