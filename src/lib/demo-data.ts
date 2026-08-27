import { isLocalNhost } from "@/lib/auth/local-preview";

/**
 * Dados de demonstração (histórico semeado, catálogo de exemplo) só fazem sentido
 * enquanto não há backend. Com Nhost configurado o app começa vazio.
 */
export function demoDataEnabled(): boolean {
  return isLocalNhost();
}
