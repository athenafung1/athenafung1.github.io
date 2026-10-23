import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, isTheme, resolveTheme } from '../../src/lib/theme.ts';

describe('THEME_STORAGE_KEY', () => {
  it('is "theme"', () => {
    expect(THEME_STORAGE_KEY).toBe('theme');
  });
});

describe('isTheme', () => {
  it('accepts only "light" and "dark"', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('Dark')).toBe(false);
    expect(isTheme('')).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('uses a stored "light" or "dark" over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('falls back to the system preference when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme(undefined, true)).toBe('dark');
  });

  it('treats any other stored value as absent', () => {
    expect(resolveTheme('sepia', true)).toBe('dark');
    expect(resolveTheme('sepia', false)).toBe('light');
    expect(resolveTheme('', false)).toBe('light');
    expect(resolveTheme('DARK', false)).toBe('light');
  });
});
