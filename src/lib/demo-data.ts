/**
 * Catálogo de exercícios/equipamentos só entra pelo banco.
 * Não inclui pessoa, treino prescrito, medida nem refeição.
 */
export function catalogDemoEnabled(): boolean {
  return false;
}

/**
 * Nunca inventa atleta, treino do dia, nutrição, evolução ou lista de usuários.
 * Quem não existe no backend não aparece na interface.
 */
export function demoDataEnabled(): boolean {
  return false;
}
