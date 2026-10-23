// Trigger logic for site-wide easter eggs (FR-019). DOM-free so it can be unit-tested.

export const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const normalise = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

/** Returns a key handler that reports true exactly when the last keys pressed spell `sequence`. */
export function createSequenceMatcher(sequence: string[]): (key: string) => boolean {
  const target = sequence.map(normalise);
  let recent: string[] = [];
  return (key) => {
    recent = [...recent, normalise(key)].slice(-target.length);
    const matched = recent.length === target.length && recent.every((k, i) => k === target[i]);
    if (matched) recent = [];
    return matched;
  };
}

/** Returns a tap handler that reports true on the `taps`-th tap within `withinMs`. */
export function createTapCounter(taps: number, withinMs: number): (timestamp: number) => boolean {
  let times: number[] = [];
  return (timestamp) => {
    times = [...times, timestamp].filter((t) => timestamp - t < withinMs);
    if (times.length >= taps) {
      times = [];
      return true;
    }
    return false;
  };
}

type TargetLike = { tagName?: string; isContentEditable?: boolean } | null | undefined;

/** Never hijack typing: ignore key events from form fields and editable content. */
export function shouldIgnoreEvent(target: TargetLike): boolean {
  if (!target) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes((target.tagName ?? '').toUpperCase());
}
