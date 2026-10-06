import { describe, expect, it } from 'vitest';
import { KONAMI, createSequenceMatcher, createTapCounter, shouldIgnoreEvent } from '../../src/lib/eggs.ts';

describe('createSequenceMatcher', () => {
  it('matches the exact sequence', () => {
    const press = createSequenceMatcher(['a', 'b', 'c']);
    expect(press('a')).toBe(false);
    expect(press('b')).toBe(false);
    expect(press('c')).toBe(true);
  });

  it('resets after a wrong key', () => {
    const press = createSequenceMatcher(['a', 'b', 'c']);
    press('a');
    press('x');
    expect(press('c')).toBe(false);
  });

  it('handles overlapping prefixes (Up, Up, Up, Down, …)', () => {
    const press = createSequenceMatcher(KONAMI);
    const keys = ['ArrowUp', ...KONAMI];
    const results = keys.map((key) => press(key));
    expect(results.at(-1)).toBe(true);
    expect(results.slice(0, -1).every((r) => r === false)).toBe(true);
  });

  it('is case-insensitive for letter keys', () => {
    const press = createSequenceMatcher(['b', 'a']);
    press('B');
    expect(press('A')).toBe(true);
  });

  it('starts over after a match', () => {
    const press = createSequenceMatcher(['a', 'b']);
    press('a');
    expect(press('b')).toBe(true);
    expect(press('b')).toBe(false);
  });
});

describe('createTapCounter', () => {
  it('fires on the n-th tap inside the window', () => {
    const tap = createTapCounter(5, 2000);
    expect([0, 300, 600, 900].map((t) => tap(t))).toEqual([false, false, false, false]);
    expect(tap(1200)).toBe(true);
  });

  it('does not fire when taps are spread outside the window', () => {
    const tap = createTapCounter(5, 2000);
    const results = [0, 600, 1200, 1800, 2400].map((t) => tap(t));
    expect(results.at(-1)).toBe(false);
  });

  it('resets after firing', () => {
    const tap = createTapCounter(2, 1000);
    tap(0);
    expect(tap(100)).toBe(true);
    expect(tap(200)).toBe(false);
  });
});

describe('shouldIgnoreEvent', () => {
  it('ignores form fields and editable content', () => {
    expect(shouldIgnoreEvent({ tagName: 'INPUT' })).toBe(true);
    expect(shouldIgnoreEvent({ tagName: 'TEXTAREA' })).toBe(true);
    expect(shouldIgnoreEvent({ tagName: 'SELECT' })).toBe(true);
    expect(shouldIgnoreEvent({ tagName: 'DIV', isContentEditable: true })).toBe(true);
  });

  it('accepts other targets', () => {
    expect(shouldIgnoreEvent({ tagName: 'BODY' })).toBe(false);
    expect(shouldIgnoreEvent({ tagName: 'A' })).toBe(false);
    expect(shouldIgnoreEvent(null)).toBe(false);
  });
});
