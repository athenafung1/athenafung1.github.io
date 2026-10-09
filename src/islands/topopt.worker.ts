// Runs topology optimisation (src/lib/topopt.ts) off the main thread so the page stays responsive:
// each iteration is a full finite-element solve, tens of milliseconds.
//
// How it works: the island sends `setup` (preset, mesh size, material budget, optional custom load);
// the worker builds the problem and a uniform starting design and posts it back. `run` starts a loop
// that does one iteration per macrotask (setTimeout 0, so pause and step messages can arrive between
// iterations) and posts every new design. It stops when no density changes by more than 1%, or after
// 150 iterations. `generation` makes a loop started before the latest setup quietly end.
import { TOPO_PRESETS, dofCount, filterWeights, initialState, iterate, node, type OptState, type Problem } from '../lib/topopt.ts';

export type SetupMessage = {
  type: 'setup';
  presetId: string;
  nelx: number;
  nely: number;
  volfrac: number;
  /** Optional single downward point load at node (ix, iy), replacing the preset's load. */
  load?: { ix: number; iy: number };
};
export type ControlMessage = { type: 'run' } | { type: 'pause' } | { type: 'step' };
export type StateMessage = { type: 'state'; x: Float64Array; iteration: number; compliance: number; change: number; done: boolean };

const MAX_ITERATIONS = 150;
const TOLERANCE = 0.01;

let problem: Problem | null = null;
let state: OptState | null = null;
let neighbours: ReturnType<typeof filterWeights> = [];
let running = false;
let generation = 0;

function post(done: boolean) {
  if (!state) return;
  const message: StateMessage = { type: 'state', x: state.x, iteration: state.iteration, compliance: state.compliance, change: state.change, done };
  self.postMessage(message);
}

function stepOnce() {
  if (!problem || !state) return true;
  state = iterate(problem, state, neighbours);
  const done = state.change < TOLERANCE || state.iteration >= MAX_ITERATIONS;
  post(done);
  return done;
}

function loop(id: number) {
  if (!running || id !== generation) return;
  if (stepOnce()) running = false;
  else setTimeout(() => loop(id), 0);
}

self.onmessage = (event: MessageEvent<SetupMessage | ControlMessage>) => {
  const message = event.data;
  if (message.type === 'setup') {
    generation++;
    running = false;
    const preset = TOPO_PRESETS.find((p) => p.id === message.presetId) ?? TOPO_PRESETS[0];
    const built = preset.build(message.nelx, message.nely);
    let force = built.force;
    if (message.load) {
      force = new Float64Array(dofCount(message.nelx, message.nely));
      force[2 * node(message.nely, message.load.ix, message.load.iy) + 1] = -1;
    }
    problem = { nelx: message.nelx, nely: message.nely, volfrac: message.volfrac, penal: 3, rmin: 1.5, force, fixed: built.fixed };
    neighbours = filterWeights(problem.nelx, problem.nely, problem.rmin);
    state = initialState(problem);
    post(false);
  } else if (message.type === 'run') {
    if (running) return;
    running = true;
    loop(generation);
  } else if (message.type === 'pause') {
    running = false;
  } else if (message.type === 'step') {
    running = false;
    stepOnce();
  }
};
