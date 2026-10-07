export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export function trajectory(t) {
  const a = -1.15 + clamp(t) * 3.6;
  return [Math.sin(a) * 7, 0, Math.cos(a) * 4.4 - 2.3];
}
export function heading(t) {
  const a = -1.15 + clamp(t) * 3.6;
  return Math.atan2(7 * Math.cos(a), -4.4 * Math.sin(a));
}
