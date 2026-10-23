// Theme decision logic shared by the inline <head> bootstrap contract and src/scripts/theme.ts.
// Erasable TypeScript only (no enums/namespaces) so Node can strip types when scripts import it.

export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** A stored "light"/"dark" wins; anything else means "follow the device". */
export function resolveTheme(stored: unknown, systemPrefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return systemPrefersDark ? 'dark' : 'light';
}
