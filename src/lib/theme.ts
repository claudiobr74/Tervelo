export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tervelo-theme";

/**
 * O app abre no tema claro — inclusive a landing, antes de qualquer login.
 * Só passa para o escuro quando a pessoa escolhe, e a escolha fica guardada.
 */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = resolved;
}

export type ThemeSnapshot = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
};

export const SERVER_THEME_SNAPSHOT: ThemeSnapshot = {
  preference: DEFAULT_THEME_PREFERENCE,
  resolved: "light",
};

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return DEFAULT_THEME_PREFERENCE;
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

const themeListeners = new Set<() => void>();

let cachedClientSnapshot: ThemeSnapshot = SERVER_THEME_SNAPSHOT;

function readClientSnapshot(): ThemeSnapshot {
  const preference = readStoredPreference();
  const resolved = resolveTheme(
    preference,
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  if (
    cachedClientSnapshot.preference === preference &&
    cachedClientSnapshot.resolved === resolved
  ) {
    return cachedClientSnapshot;
  }

  cachedClientSnapshot = { preference, resolved };
  return cachedClientSnapshot;
}

function emitThemeChange(): void {
  for (const listener of themeListeners) {
    listener();
  }
}

export function getThemeSnapshot(): ThemeSnapshot {
  if (typeof window === "undefined") {
    return SERVER_THEME_SNAPSHOT;
  }
  return readClientSnapshot();
}

export function getServerThemeSnapshot(): ThemeSnapshot {
  return SERVER_THEME_SNAPSHOT;
}

export function subscribeTheme(listener: () => void): () => void {
  themeListeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  window.addEventListener("storage", listener);
  return () => {
    themeListeners.delete(listener);
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
  };
}

export function persistThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // persistência é best-effort
  }
  applyResolvedTheme(
    resolveTheme(preference, window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
  emitThemeChange();
}

export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME_PREFERENCE)};var p=localStorage.getItem(k)||d;if(p!=="light"&&p!=="dark"&&p!=="system")p=d;var dark=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",dark);r.dataset.theme=dark?"dark":"light";}catch(e){document.documentElement.classList.remove("dark");document.documentElement.dataset.theme="light";}})();`;
