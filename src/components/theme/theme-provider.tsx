"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applyResolvedTheme,
  getServerThemeSnapshot,
  getThemeSnapshot,
  persistThemePreference,
  subscribeTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useLayoutEffect(() => {
    applyResolvedTheme(snapshot.resolved);
  }, [snapshot.resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    persistThemePreference(next);
  }, []);

  const value = useMemo(
    () => ({
      preference: snapshot.preference,
      resolved: snapshot.resolved,
      setPreference,
    }),
    [snapshot.preference, snapshot.resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
