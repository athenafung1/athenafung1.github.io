// Theme toggle wiring (FR-034). The inline bootstrap in BaseLayout already applied any stored
// choice before first paint; this module reveals the toggle and handles changes.
import { THEME_STORAGE_KEY, isTheme, resolveTheme, type Theme } from '../lib/theme.ts';

const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');

function readStored(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private window): the choice still applies to this page view.
  }
}

function currentTheme(): Theme {
  const applied = root.dataset.theme;
  return isTheme(applied) ? applied : resolveTheme(readStored(), media.matches);
}

const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];

function sync(): void {
  const dark = currentTheme() === 'dark';
  for (const button of buttons) button.setAttribute('aria-pressed', String(dark));
}

for (const button of buttons) {
  button.hidden = false;
  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    writeStored(next);
    sync();
  });
}

// While nothing is chosen, CSS follows the device live; keep the button state in step.
media.addEventListener('change', sync);
sync();
