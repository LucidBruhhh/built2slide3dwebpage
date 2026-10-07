import { clamp } from "./trajectory.js";
export const smooth = (a, b, t) => {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export function driftAngle(t) {
  return 0.12 + 0.56 * smooth(0.05, 0.3, t) - 0.6 * smooth(0.73, 1, t);
}
export function driftStrength(t) {
  return smooth(0.04, 0.24, t) * (1 - smooth(0.78, 1, t));
}
export function shot(t) {
  return {
    azimuth: 0.65 + 0.8 * smooth(0.12, 0.55, t) + 1.35 * smooth(0.62, 0.98, t),
    distance: 7.4 - 1.0 * smooth(0.12, 0.45, t) + 0.5 * smooth(0.75, 1, t),
    height: 2.8 - 0.65 * smooth(0.1, 0.4, t) + 0.25 * smooth(0.7, 1, t),
  };
}
