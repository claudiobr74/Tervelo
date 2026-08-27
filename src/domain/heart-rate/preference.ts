import { DEFAULT_HEART_RATE_ENABLED } from "./types";

export function parseHeartRateEnabled(value: unknown): boolean {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0" || value == null) {
    return DEFAULT_HEART_RATE_ENABLED;
  }
  return DEFAULT_HEART_RATE_ENABLED;
}

export function heartRatePreferencePatch(enabled: boolean): {
  preferenceKey: "heart_rate_enabled";
  preferenceValue: "true" | "false";
} {
  return {
    preferenceKey: "heart_rate_enabled",
    preferenceValue: enabled ? "true" : "false",
  };
}
