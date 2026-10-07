// Classic fourth-order Runge–Kutta for systems y' = f(y) with an array state.

export type Derivative = (state: number[]) => number[];

export function rk4(f: Derivative, state: number[], dt: number): number[] {
  const k1 = f(state);
  const k2 = f(state.map((v, i) => v + (dt / 2) * k1[i]));
  const k3 = f(state.map((v, i) => v + (dt / 2) * k2[i]));
  const k4 = f(state.map((v, i) => v + dt * k3[i]));
  return state.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}
