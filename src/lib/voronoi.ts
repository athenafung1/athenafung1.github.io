// Voronoi cells by half-plane clipping: each site's cell is the box intersected with every
// "closer to me than to site j" half-plane. O(n²·k), plenty fast for a few dozen sites.
import type { Point } from './curves.ts';

/**
 * n random sites in the box. With minDistance > 0, a candidate closer than that to an existing site
 * is rejected and redrawn (dart throwing, a cheap Poisson-disc sample). Cells then come out evenly
 * sized, like cells in tissue, and no two dots land on top of each other, which would put the edge
 * between their cells right beside both. If no valid spot turns up in 30 tries, the candidate
 * farthest from its neighbours is kept, so exactly n sites always come back.
 */
export function randomSites(n: number, width: number, height: number, rand: () => number, minDistance = 0): Point[] {
  const sites: Point[] = [];
  const gap = (p: Point) => sites.reduce((min, s) => Math.min(min, Math.hypot(s.x - p.x, s.y - p.y)), Infinity);
  for (let i = 0; i < n; i++) {
    let best = { x: rand() * width, y: rand() * height };
    let bestGap = gap(best);
    for (let tries = 1; tries < 30 && bestGap < minDistance; tries++) {
      const candidate = { x: rand() * width, y: rand() * height };
      const candidateGap = gap(candidate);
      if (candidateGap > bestGap) {
        best = candidate;
        bestGap = candidateGap;
      }
    }
    sites.push(best);
  }
  return sites;
}

/** Keep the part of `polygon` on the side of the perpendicular bisector closer to `a` than `b`. */
function clip(polygon: Point[], a: Point, b: Point): Point[] {
  // Points p with (p − m)·(b − a) ≤ 0 are closer to a, where m is the midpoint.
  const nx = b.x - a.x;
  const ny = b.y - a.y;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const side = (p: Point) => (p.x - mx) * nx + (p.y - my) * ny;
  const out: Point[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    const q = polygon[(i + 1) % polygon.length];
    const sp = side(p);
    const sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
      const t = sp / (sp - sq);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
  }
  return out;
}

export function voronoiCells(sites: Point[], width: number, height: number): Point[][] {
  const box: Point[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
  return sites.map((site, i) => {
    let cell = box;
    for (let j = 0; j < sites.length && cell.length > 0; j++) {
      if (j !== i && (sites[j].x !== site.x || sites[j].y !== site.y)) cell = clip(cell, site, sites[j]);
    }
    return cell;
  });
}

/** Signed shoelace area (positive for clockwise in screen coordinates). */
export function polygonArea(polygon: Point[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    const q = polygon[(i + 1) % polygon.length];
    sum += p.x * q.y - q.x * p.y;
  }
  return sum / 2;
}

export function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
