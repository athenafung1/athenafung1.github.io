import { describe, expect, it } from 'vitest';
import { assertUniqueOrder, selectFeatured, sortProjects } from '../../src/lib/projects.ts';

const p = (id: string, featured: boolean, order: number) => ({ id, data: { featured, order } });

describe('sortProjects', () => {
  it('puts featured projects first, then orders each group ascending', () => {
    const list = [p('c', false, 2), p('a', true, 2), p('d', false, 1), p('b', true, 1)];
    expect(sortProjects(list).map((x) => x.id)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('is stable for equal keys and does not mutate the input', () => {
    const list = [p('x', false, 1), p('y', false, 1)];
    const copy = [...list];
    expect(sortProjects(list).map((x) => x.id)).toEqual(['x', 'y']);
    expect(list).toEqual(copy);
  });
});

describe('selectFeatured', () => {
  it('returns featured projects in order, capped at the limit', () => {
    const list = [p('a', true, 3), p('b', true, 1), p('c', false, 1), p('d', true, 2), p('e', true, 4)];
    expect(selectFeatured(list, 3).map((x) => x.id)).toEqual(['b', 'd', 'a']);
  });

  it('defaults to a limit of 3', () => {
    const list = [p('a', true, 1), p('b', true, 2), p('c', true, 3), p('d', true, 4)];
    expect(selectFeatured(list)).toHaveLength(3);
  });

  it('throws when no project is featured', () => {
    expect(() => selectFeatured([p('a', false, 1)])).toThrow(/featured/);
  });
});

describe('assertUniqueOrder', () => {
  it('accepts the same order in different featured groups', () => {
    expect(() => assertUniqueOrder([p('a', true, 1), p('b', false, 1)])).not.toThrow();
  });

  it('throws, naming both ids, when two entries in one group share an order', () => {
    expect(() => assertUniqueOrder([p('alpha', false, 2), p('beta', false, 2)])).toThrow(/alpha.*beta|beta.*alpha/);
  });
});
