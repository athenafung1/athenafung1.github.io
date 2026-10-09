// 2-D compliance topology optimisation (SIMP), after Sigmund's "A 99 line topology optimization code
// written in Matlab" (2001).
//
// Concept: divide a rectangle into small square elements, each with a density x between 0 (empty)
// and 1 (solid). Given loads, supports and a material budget, find the densities that make the
// structure as stiff as possible, i.e. minimise compliance c = fᵀu (the work the load does bending
// it). Each iteration:
//   1. Finite-element analysis: assemble the global stiffness matrix K from every element's
//      stiffness, scaled by x^p, and solve K u = f for the displacement of every node.
//   2. Sensitivities: how much compliance would drop if each element got denser. Elements that
//      store a lot of strain energy (they are working hard) score highest.
//   3. Filter: average each sensitivity with its neighbours' so the design cannot form a
//      checkerboard and struts do not get finer as the mesh does.
//   4. Optimality-criteria update: move material toward high-sensitivity elements, a limited step at
//      a time, while keeping the total equal to the budget.
// The penalty p = 3 (SIMP: "solid isotropic material with penalisation") makes half-dense elements
// poor value for their material, so the design converges to solid struts and holes. The same rule,
// material goes where the stress is, is how bone remodels (Wolff's law).
//
// How this code works: bilinear four-node (Q4) plane-stress elements, 2 degrees of freedom (dofs) per
// node: x and y displacement. Nodes are numbered column by column, so K is banded (a node only
// couples to nodes about one column away), and solveBanded() factorises just that band (Cholesky,
// K = LLᵀ). An iteration costs O(n·b²) instead of O(n³) for n dofs and half-bandwidth b.

export type Problem = {
  nelx: number;
  nely: number;
  volfrac: number;
  penal: number;
  rmin: number;
  /** Load vector (length = number of dofs). */
  force: Float64Array;
  /** Indices of fixed degrees of freedom. */
  fixed: number[];
};

export type OptState = {
  x: Float64Array; // element densities, column-major: index = elx * nely + ely
  iteration: number;
  compliance: number;
  change: number;
};

/**
 * Element stiffness matrix k₀ for a unit square Q4 element, E = 1 (from the 99-line code): the 8×8
 * matrix turning the element's 8 corner displacements into the 8 corner forces they cause. It has
 * only 8 distinct entries, placed by symmetry through `map`. Every element uses it, scaled by x^p.
 */
export function elementStiffness(nu = 0.3): Float64Array {
  const k = [
    1 / 2 - nu / 6,
    1 / 8 + nu / 8,
    -1 / 4 - nu / 12,
    -1 / 8 + (3 * nu) / 8,
    -1 / 4 + nu / 12,
    -1 / 8 - nu / 8,
    nu / 6,
    1 / 8 - (3 * nu) / 8,
  ];
  const map = [
    [0, 1, 2, 3, 4, 5, 6, 7],
    [1, 0, 7, 6, 5, 4, 3, 2],
    [2, 7, 0, 5, 6, 3, 4, 1],
    [3, 6, 5, 0, 7, 2, 1, 4],
    [4, 5, 6, 7, 0, 1, 2, 3],
    [5, 4, 3, 2, 1, 0, 7, 6],
    [6, 3, 4, 1, 2, 7, 0, 5],
    [7, 2, 1, 4, 3, 6, 5, 0],
  ];
  const ke = new Float64Array(64);
  const scale = 1 / (1 - nu * nu);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) ke[i * 8 + j] = scale * k[map[i][j]];
  return ke;
}

export const dofCount = (nelx: number, nely: number) => 2 * (nelx + 1) * (nely + 1);
/** Node index at column `ix` (0…nelx), row `iy` (0…nely, top to bottom). */
export const node = (nely: number, ix: number, iy: number) => (nely + 1) * ix + iy;

/** Global dofs of element (elx, ely), in the 99-line code's order. */
export function elementDofs(nely: number, elx: number, ely: number): number[] {
  const n1 = node(nely, elx, ely);
  const n2 = node(nely, elx + 1, ely);
  return [2 * n1, 2 * n1 + 1, 2 * n2, 2 * n2 + 1, 2 * n2 + 2, 2 * n2 + 3, 2 * n1 + 2, 2 * n1 + 3];
}

/**
 * Half-bandwidth of the global stiffness matrix with column-major node numbering: K_ij is non-zero
 * only if dofs i and j share an element, and one element's dofs span at most 2·(nely + 1) + 3.
 */
export const halfBandwidth = (nely: number) => 2 * nely + 5;

/** Solve A u = f for symmetric positive-definite banded A (lower band stored row by row). */
export function solveBanded(band: Float64Array, n: number, b: number, f: Float64Array): Float64Array {
  const w = b + 1;
  const at = (i: number, j: number) => i * w + (i - j); // requires 0 ≤ i − j ≤ b
  // Cholesky: A = L Lᵀ, overwriting the band with L.
  for (let i = 0; i < n; i++) {
    const j0 = Math.max(0, i - b);
    for (let j = j0; j <= i; j++) {
      let sum = band[at(i, j)];
      const k0 = Math.max(j0, j - b);
      for (let k = k0; k < j; k++) sum -= band[at(i, k)] * band[at(j, k)];
      if (i === j) {
        if (sum <= 0) throw new Error('solveBanded: matrix is not positive definite');
        band[at(i, i)] = Math.sqrt(sum);
      } else band[at(i, j)] = sum / band[at(j, j)];
    }
  }
  // Forward substitution: L y = f.
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = f[i];
    for (let k = Math.max(0, i - b); k < i; k++) sum -= band[at(i, k)] * y[k];
    y[i] = sum / band[at(i, i)];
  }
  // Back substitution: Lᵀ u = y.
  const u = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let k = i + 1; k <= Math.min(n - 1, i + b); k++) sum -= band[at(k, i)] * u[k];
    u[i] = sum / band[at(i, i)];
  }
  return u;
}

const KE = elementStiffness();

/**
 * Finite-element analysis: displacements for densities x. Assembles K = Σ_e x_e^p · k₀ (each
 * element's matrix added at its 8 global dofs; only the lower band is stored, since K is symmetric),
 * applies the supports and solves K u = f.
 */
export function solveDisplacements(p: Problem, x: Float64Array): Float64Array {
  const { nelx, nely, penal } = p;
  const n = dofCount(nelx, nely);
  const b = halfBandwidth(nely);
  const w = b + 1;
  const band = new Float64Array(n * w);
  for (let elx = 0; elx < nelx; elx++) {
    for (let ely = 0; ely < nely; ely++) {
      const stiffness = x[elx * nely + ely] ** penal;
      const dofs = elementDofs(nely, elx, ely);
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const i = dofs[r];
          const j = dofs[c];
          if (j <= i) band[i * w + (i - j)] += stiffness * KE[r * 8 + c];
        }
      }
    }
  }
  const f = Float64Array.from(p.force);
  // Fixed dofs: replace the row and column with the identity, and zero the load.
  for (const d of p.fixed) {
    for (let j = Math.max(0, d - b); j < d; j++) band[d * w + (d - j)] = 0;
    for (let i = d + 1; i <= Math.min(n - 1, d + b); i++) band[i * w + (i - d)] = 0;
    band[d * w] = 1;
    f[d] = 0;
  }
  return solveBanded(band, n, b, f);
}

/**
 * Neighbour weights for the sensitivity filter (precomputed once per mesh): every element closer
 * than rmin, weighted rmin − distance, so near neighbours count most.
 */
export function filterWeights(nelx: number, nely: number, rmin: number) {
  const r = Math.ceil(rmin);
  const neighbours: Array<Array<[number, number]>> = [];
  for (let i = 0; i < nelx; i++) {
    for (let j = 0; j < nely; j++) {
      const list: Array<[number, number]> = [];
      for (let k = Math.max(i - r, 0); k <= Math.min(i + r, nelx - 1); k++) {
        for (let l = Math.max(j - r, 0); l <= Math.min(j + r, nely - 1); l++) {
          const fac = rmin - Math.hypot(i - k, j - l);
          if (fac > 0) list.push([k * nely + l, fac]);
        }
      }
      neighbours.push(list);
    }
  }
  return neighbours;
}

export function initialState(p: Problem): OptState {
  return { x: new Float64Array(p.nelx * p.nely).fill(p.volfrac), iteration: 0, compliance: Number.NaN, change: 1 };
}

/** One optimisation iteration: analysis, sensitivities, filter, OC update. */
export function iterate(p: Problem, state: OptState, neighbours = filterWeights(p.nelx, p.nely, p.rmin)): OptState {
  const { nelx, nely, penal, volfrac } = p;
  const x = state.x;
  // 1. Analysis.
  const u = solveDisplacements(p, x);
  const m = nelx * nely;
  const dc = new Float64Array(m);
  let compliance = 0;
  for (let elx = 0; elx < nelx; elx++) {
    for (let ely = 0; ely < nely; ely++) {
      const e = elx * nely + ely;
      const dofs = elementDofs(nely, elx, ely);
      let uKu = 0;
      for (let r = 0; r < 8; r++) {
        let row = 0;
        for (let c = 0; c < 8; c++) row += KE[r * 8 + c] * u[dofs[c]];
        uKu += u[dofs[r]] * row;
      }
      // 2. Element e stores strain energy x_e^p·u_eᵀk₀u_e; compliance is the sum. Its derivative
      // with respect to x_e (the sensitivity) is negative: more material, less compliance.
      compliance += x[e] ** penal * uKu;
      dc[e] = -penal * x[e] ** (penal - 1) * uKu;
    }
  }
  // 3. Sensitivity filter: a density-weighted average over neighbours. Without it the optimum is a
  // checkerboard of solid and empty elements, and finer meshes give ever finer struts.
  const dcn = new Float64Array(m);
  for (let e = 0; e < m; e++) {
    let sum = 0;
    let acc = 0;
    for (const [k, fac] of neighbours[e]) {
      sum += fac;
      acc += fac * x[k] * dc[k];
    }
    dcn[e] = acc / (x[e] * sum);
  }
  // 4. Optimality criteria: scale each density by √(−dc / λ), so elements whose material pays off
  // more than average grow and the rest shrink, by at most `move` per iteration and within
  // [0.001, 1] (never exactly 0, which would make K singular). λ acts as the price of material and
  // is found by bisection so the total matches the budget.
  const move = 0.2;
  const xnew = new Float64Array(m);
  let l1 = 0;
  let l2 = 1e5;
  while (l2 - l1 > 1e-4 * Math.max(1, l2)) {
    const lmid = 0.5 * (l1 + l2);
    let total = 0;
    for (let e = 0; e < m; e++) {
      const candidate = x[e] * Math.sqrt(Math.max(0, -dcn[e]) / lmid);
      xnew[e] = Math.max(0.001, Math.max(x[e] - move, Math.min(1, Math.min(x[e] + move, candidate))));
      total += xnew[e];
    }
    if (total - volfrac * m > 0) l1 = lmid;
    else l2 = lmid;
  }
  let change = 0;
  for (let e = 0; e < m; e++) change = Math.max(change, Math.abs(xnew[e] - x[e]));
  return { x: xnew, iteration: state.iteration + 1, compliance, change };
}

export type TopoPreset = { id: string; label: string; note: string; build: (nelx: number, nely: number) => { force: Float64Array; fixed: number[] } };

// Each preset returns the load vector and the clamped dofs. Dof 2n is node n's horizontal
// displacement and 2n + 1 its vertical one; −1 on a vertical dof is a downward load.
export const TOPO_PRESETS: TopoPreset[] = [
  {
    id: 'cantilever',
    label: 'Cantilever',
    note: 'Wall on the left, weight hanging from the right: like a femoral neck holding the body’s weight.',
    build(nelx, nely) {
      const force = new Float64Array(dofCount(nelx, nely));
      force[2 * node(nely, nelx, Math.floor(nely / 2)) + 1] = -1;
      const fixed = Array.from({ length: 2 * (nely + 1) }, (_, i) => i);
      return { force, fixed };
    },
  },
  {
    id: 'bridge',
    label: 'Bridge',
    note: 'Pinned at both bottom corners with load spread along the top deck.',
    build(nelx, nely) {
      const force = new Float64Array(dofCount(nelx, nely));
      for (let ix = 0; ix <= nelx; ix++) force[2 * node(nely, ix, 0) + 1] = -1 / (nelx + 1);
      const left = node(nely, 0, nely);
      const right = node(nely, nelx, nely);
      return { force, fixed: [2 * left, 2 * left + 1, 2 * right, 2 * right + 1] };
    },
  },
  {
    id: 'mbb',
    label: 'Beam (MBB)',
    note: 'The classic benchmark: half of a simply supported beam with a central load, using symmetry.',
    build(nelx, nely) {
      const force = new Float64Array(dofCount(nelx, nely));
      force[1] = -1;
      const fixed = Array.from({ length: nely + 1 }, (_, i) => 2 * i);
      fixed.push(2 * node(nely, nelx, nely) + 1);
      return { force, fixed };
    },
  },
];
