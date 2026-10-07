import test from "node:test";
import assert from "node:assert/strict";
import { trajectory, heading } from "../src/animation/trajectory.js";
test("trajectory is finite, continuous and clamps scroll beyond its bounds", () => {
  assert.deepEqual(trajectory(-1), trajectory(0));
  assert.deepEqual(trajectory(2), trajectory(1));
  let previous = trajectory(0);
  for (let i = 1; i <= 1000; i++) {
    const p = trajectory(i / 1000);
    assert.ok(p.every(Number.isFinite));
    assert.ok(Math.hypot(...p.map((v, j) => v - previous[j])) < 0.03);
    previous = p;
  }
});
test("heading aligns with the curve tangent before the intentional drift yaw is added", () => {
  for (let i = 0; i < 100; i++) {
    const t = i / 100,
      a = trajectory(t),
      b = trajectory(t + 0.00001),
      h = heading(t);
    const dx = b[0] - a[0],
      dz = b[2] - a[2];
    assert.ok(
      (dx * Math.sin(h) + dz * Math.cos(h)) / Math.hypot(dx, dz) > 0.999,
    );
  }
});
