// Project ordering rules (FR-011, FR-007). Generic over Astro collection entries.

type Orderable = { id: string; data: { featured: boolean; order: number } };

/** Featured first, then `order` ascending within each group. Stable; returns a new array. */
export function sortProjects<T extends Orderable>(list: readonly T[]): T[] {
  return [...list].sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.order - b.data.order,
  );
}

/** Featured projects for the landing page, in display order. The landing page needs at least one. */
export function selectFeatured<T extends Orderable>(list: readonly T[], limit = 3): T[] {
  const featured = sortProjects(list).filter((entry) => entry.data.featured);
  if (featured.length === 0) {
    throw new Error('No featured project: set `featured: true` on at least one file in src/content/projects/.');
  }
  return featured.slice(0, limit);
}

/** Two entries in the same featured group may not share an `order` (keeps ordering deterministic). */
export function assertUniqueOrder<T extends Orderable>(list: readonly T[]): void {
  const seen = new Map<string, string>();
  for (const entry of list) {
    const key = `${entry.data.featured}:${entry.data.order}`;
    const other = seen.get(key);
    if (other) {
      throw new Error(
        `src/content/projects: "${other}" and "${entry.id}" both have order ${entry.data.order}` +
          ` (featured: ${entry.data.featured}). Give each a unique order.`,
      );
    }
    seen.set(key, entry.id);
  }
}
