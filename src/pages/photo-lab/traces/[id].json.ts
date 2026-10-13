// Each photo's line drawing (from scripts/prepare-photos.mjs) as its own small file,
// /photo-lab/traces/<id>.json, fetched when that photo is about to be drawn. Keeping traces out of
// the page means a strip of many photos doesn't grow the HTML.
import type { APIRoute, GetStaticPaths } from 'astro';
import measured from '../../../data/photos-meta.json';

const traces = measured as unknown as Record<string, { trace: { points: number[]; lifts: [number, number][] } }>;

export const getStaticPaths = (() => Object.keys(traces).map((id) => ({ params: { id } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(traces[params.id!].trace), { headers: { 'Content-Type': 'application/json' } });
