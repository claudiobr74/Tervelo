export const PASSWORD_MIN_LENGTH = 9;
export const PASSWORD_MAX_LENGTH = 50;
export const DISPLAY_NAME_MAX_LENGTH = 32;

const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N}\p{S} ,.'-]+$/u;

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidDisplayName(value: string): boolean {
  const name = value.trim();
  return (
    name.length >= 2 && name.length <= DISPLAY_NAME_MAX_LENGTH && DISPLAY_NAME_PATTERN.test(name)
  );
}
