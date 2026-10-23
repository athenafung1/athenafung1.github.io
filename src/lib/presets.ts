// Closed shapes for the Fourier Sketch preset buttons and its build-time fallback.
import { rose, type Point } from './curves.ts';

export type Preset = { id: string; label: string; points: Point[] };

// "AF" as one continuous closed stroke: A's outer legs, along the baseline to F, F's bars
// (retraced), back along the baseline, up A's right leg to the crossbar, across it, and the
// closing segment returns down A's left leg to the start. Units: 1 = letter height.
const initials: Point[] = [
  { x: 0, y: 1 },
  { x: 0.35, y: 0 },
  { x: 0.7, y: 1 },
  { x: 0.9, y: 1 },
  { x: 0.9, y: 0 },
  { x: 1.4, y: 0 },
  { x: 0.9, y: 0 },
  { x: 0.9, y: 0.47 },
  { x: 1.28, y: 0.47 },
  { x: 0.9, y: 0.47 },
  { x: 0.9, y: 1 },
  { x: 0.7, y: 1 },
  { x: 0.595, y: 0.7 },
  { x: 0.105, y: 0.7 },
];

const star: Point[] = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 1 : 0.42;
  const angle = -Math.PI / 2 + (Math.PI * i) / 5;
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
});

export const PRESETS: Preset[] = [
  { id: 'initials', label: 'AF', points: initials },
  { id: 'star', label: 'Star', points: star },
  { id: 'trefoil', label: 'Trefoil', points: rose(3, 180).slice(0, -1) },
];
