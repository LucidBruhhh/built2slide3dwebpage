import React, { useMemo, useEffect } from "react";
import * as T from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Photo-reference reconstruction of BRUH. Metres, nose +Z, wheels at Y .46.
// Static parts are batched by material so the small rivets do not add draw calls.
export function createBruhSkyline() {
  const buckets = new Map();
  const std = (color, roughness = 0.4, metalness = 0) =>
    new T.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      side: T.DoubleSide,
    });
  const paint = new T.MeshPhysicalMaterial({
    color: "#f4f3ee",
    roughness: 0.26,
    metalness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    side: T.DoubleSide,
  });
  const black = std("#121418", 0.54),
    rubber = std("#161719", 0.92),
    chrome = std("#c2c7cb", 0.22, 0.87),
    rim = std("#25272b", 0.32, 0.7),
    glass = std("#15252f", 0.16, 0.38),
    seam = std("#565a5c", 0.6),
    red = std("#b20f20", 0.22, 0.25),
    amber = std("#ec840f", 0.24, 0.2),
    lens = std("#74828b", 0.18, 0.5);
  function add(g, m, p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
    if (!m.map) g.deleteAttribute("uv");
    g.applyMatrix4(
      new T.Matrix4().compose(
        new T.Vector3(...p),
        new T.Quaternion().setFromEuler(new T.Euler(...r)),
        new T.Vector3(...s),
      ),
    );
    if (!buckets.has(m)) buckets.set(m, []);
    buckets.get(m).push(g.index ? g.toNonIndexed() : g);
  }
  const box = (p, s, m, r) =>
    add(
      m === paint
        ? new RoundedBoxGeometry(...s, 3, Math.min(0.04, Math.min(...s) * 0.32))
        : new T.BoxGeometry(...s),
      m,
      p,
      r,
    );
  const ball = (p, s, m) =>
    add(new T.SphereGeometry(1, 20, 12), m, p, undefined, s);
  const tube = (pts, radius, m) =>
    add(
      new T.TubeGeometry(
        new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(...p))),
        Math.max(12, pts.length * 6),
        radius,
        6,
        false,
      ),
      m,
    );
  const cylinder = (p, rad, depth, m, r = [Math.PI / 2, 0, 0]) =>
    add(new T.CylinderGeometry(rad, rad, depth, 40), m, p, r);
  function surface(rows, m) {
    const pos = [],
      idx = [];
    rows.forEach((row) => row.forEach((p) => pos.push(...p)));
    const n = rows[0].length;
    for (let a = 0; a < rows.length - 1; a++)
      for (let b = 0; b < n - 1; b++) {
        const i = a * n + b;
        idx.push(i, i + n, i + 1, i + 1, i + n, i + n + 1);
      }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    add(g, m);
  }
  function panel(points, m) {
    surface([points.slice(0, 2), [points[3], points[2]]], m);
  }
  function decal(
    text,
    w,
    h,
    {
      bg = null,
      color = "#151719",
      font = "bold 90px Arial",
      sub = "",
      subTop = false,
    } = {},
  ) {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = Math.round((1024 * h) / w);
    const x = c.getContext("2d");
    if (bg) {
      x.fillStyle = bg;
      x.fillRect(0, 0, c.width, c.height);
    }
    x.fillStyle = color;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = font;
    x.fillText(text, 512, c.height * (sub ? (subTop ? 0.62 : 0.36) : 0.5), 970);
    if (sub) {
      x.font = "bold 34px Arial";
      x.fillText(sub, 512, c.height * (subTop ? 0.18 : 0.76), 970);
    }
    const map = new T.CanvasTexture(c);
    map.colorSpace = T.SRGBColorSpace;
    map.anisotropy = 4;
    return new T.MeshStandardMaterial({
      map,
      transparent: !bg,
      roughness: 0.65,
      side: T.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
  }
  const plate = decal("BRUH", 0.43, 0.23, {
    bg: "#f5f3e9",
    font: "bold 230px Arial",
    sub: "N S W",
    subTop: true,
  });
  const banner = decal("Skyline ♛ Society", 1.3, 0.17, {
    bg: "#efefea",
    font: "italic 88px Georgia",
  });
  const slogan = decal("MY OWNER ABUSES ME", 0.86, 0.13, {
    font: "italic bold 72px Arial",
    sub: "AND I LOVE IT",
  });
  function flat(p, w, h, m, r = [0, 0, 0]) {
    add(new T.PlaneGeometry(w, h), m, p, r);
  }

  // Smooth body skin: the lower edge follows all four wheel openings.
  const profile = [
    [-2.28, 0.84, 0.88],
    [-2.13, 0.94, 0.96],
    [-1.7, 1.02, 0.97],
    [-0.85, 1.02, 0.94],
    [0.55, 1, 0.93],
    [1.35, 0.96, 0.95],
    [1.95, 0.89, 0.91],
    [2.27, 0.9, 0.86],
  ];
  function shapeAt(z) {
    let k = profile.findIndex((v) => v[0] >= z);
    k = Math.max(1, k);
    const a = profile[k - 1],
      b = profile[k],
      t = (z - a[0]) / (b[0] - a[0]);
    return [T.MathUtils.lerp(a[1], b[1], t), T.MathUtils.lerp(a[2], b[2], t)];
  }
  const rows = [];
  for (let i = 0; i <= 180; i++) {
    const z = -2.28 + (i * 4.55) / 180,
      [y, w] = shapeAt(z);
    const d = Math.min(Math.abs(z + 1.39), Math.abs(z - 1.37));
    const bottom = d < 0.535 ? 0.46 + Math.sqrt(0.535 ** 2 - d * d) : 0.29;
    rows.push([
      [-w * 0.96, bottom, z],
      [-w, Math.max(bottom, y - 0.13), z],
      [-w * 0.96, Math.max(bottom, y - 0.035), z],
      [-w * 0.84, y + 0.015, z],
      [0, y + 0.048, z],
      [w * 0.84, y + 0.015, z],
      [w * 0.96, Math.max(bottom, y - 0.035), z],
      [w, Math.max(bottom, y - 0.13), z],
      [w * 0.96, bottom, z],
    ]);
  }
  surface(rows, paint);
  box([0, 0.3, 0], [1.65, 0.1, 3.7], black);
  // Coupe glasshouse: broad C pillars and curved low roof, distinct from an R32.
  const roof = [];
  for (let i = 0; i <= 24; i++) {
    const z = -0.7 + (i * 1.08) / 24,
      y = 1.515 + 0.045 * Math.sin((i / 24) * Math.PI),
      w = 0.727 + 0.012 * Math.sin((i / 24) * Math.PI);
    roof.push([
      [-w, y - 0.055, z],
      [-w * 0.85, y - 0.012, z],
      [0, y + 0.005, z],
      [w * 0.85, y - 0.012, z],
      [w, y - 0.055, z],
    ]);
  }
  surface(roof, paint);
  surface(
    [
      [
        [-0.72, 1.49, 0.38],
        [0, 1.54, 0.38],
        [0.72, 1.49, 0.38],
      ],
      [
        [-0.85, 1.032, 1.04],
        [0, 1.075, 1.055],
        [0.85, 1.032, 1.04],
      ],
    ],
    glass,
  );
  surface(
    [
      [
        [-0.72, 1.47, -0.7],
        [0, 1.52, -0.7],
        [0.72, 1.47, -0.7],
      ],
      [
        [-0.835, 1.055, -1.42],
        [0, 1.075, -1.48],
        [0.835, 1.055, -1.42],
      ],
    ],
    glass,
  );
  for (const s of [-1, 1]) {
    panel(
      [
        [s * 0.925, 1.025, -1.32],
        [s * 0.73, 1.472, -0.67],
        [s * 0.733, 1.48, 0.36],
        [s * 0.9, 1.025, 1.005],
      ],
      glass,
    );
    tube(
      [
        [s * 0.91, 1.03, 1.045],
        [s * 0.81, 1.255, 0.71],
        [s * 0.72, 1.49, 0.38],
      ],
      0.036,
      paint,
    );
    tube(
      [
        [s * 0.725, 1.475, 0.38],
        [s * 0.735, 1.5, -0.25],
        [s * 0.72, 1.475, -0.7],
        [s * 0.855, 1.07, -1.41],
      ],
      0.04,
      paint,
    );
    panel(
      [
        [s * 0.727, 1.474, -0.69],
        [s * 0.85, 1.059, -1.43],
        [s * 0.925, 1.027, -1.3],
        [s * 0.757, 1.443, -0.51],
      ],
      paint,
    );
    tube(
      [
        [s * 0.918, 1.035, -1.3],
        [s * 0.942, 1.034, -0.35],
        [s * 0.905, 1.034, 0.99],
      ],
      0.015,
      black,
    );
    tube(
      [
        [s * 0.927, 1.035, -0.36],
        [s * 0.739, 1.494, -0.26],
      ],
      0.024,
      black,
    );
    // Door shut line, handle and side skirt.
    tube(
      [
        [s * 0.94, 1.025, 0.88],
        [s * 0.95, 0.69, 0.85],
        [s * 0.935, 0.37, 0.68],
        [s * 0.947, 0.35, -0.55],
        [s * 0.956, 0.51, -0.64],
        [s * 0.939, 1.02, -0.65],
      ],
      0.005,
      seam,
    );
    ball([s * 0.963, 0.9, -0.39], [0.012, 0.027, 0.087], seam);
    box([s * 0.98, 0.912, -0.39], [0.017, 0.022, 0.115], paint);
    box([s * 0.966, 0.29, 0], [0.105, 0.115, 1.66], paint);
    box([s * 0.977, 0.247, 0], [0.095, 0.024, 1.73], black);
    tube(
      [
        [s * 0.88, 1.045, 0.73],
        [s * 1.04, 1.08, 0.72],
      ],
      0.035,
      black,
    );
    ball([s * 1.067, 1.1, 0.735], [0.14, 0.077, 0.12], paint);
    ball([s * 1.073, 1.1, 0.655], [0.11, 0.049, 0.023], glass);
    box([s * 0.957, 0.78, 1.03], [0.02, 0.048, 0.09], chrome);
    box([s * 0.97, 0.78, 1.03], [0.005, 0.03, 0.065], amber);
    // Bolted overfenders wrap the real open wheel wells.
    for (const z of [-1.39, 1.37]) {
      const arch = [];
      for (let j = 0; j <= 48; j++) {
        const a = -0.16 + (j / 48) * (Math.PI + 0.32),
          sin = Math.sin(a),
          cos = Math.cos(a);
        arch.push([
          [
            s * (sin > 0.7 ? 0.78 : 0.943),
            sin > 0.7 ? shapeAt(z + 0.6 * cos)[0] + 0.015 : 0.46 + 0.6 * sin,
            z + 0.6 * cos,
          ],
          [s * 1.04, 0.46 + 0.55 * sin, z + 0.55 * cos],
          [s * 1.063, 0.46 + 0.536 * sin, z + 0.536 * cos],
        ]);
      }
      surface(arch, paint);
      for (let j = 0; j < 9; j++) {
        const a = 0.07 + (j * (Math.PI - 0.14)) / 8;
        ball(
          [
            s * 0.99,
            Math.min(1.01, 0.46 + 0.57 * Math.sin(a)),
            z + 0.57 * Math.cos(a),
          ],
          [0.012, 0.012, 0.012],
          chrome,
        );
        ball(
          [
            s * 1.0,
            Math.min(1.01, 0.46 + 0.57 * Math.sin(a)),
            z + 0.57 * Math.cos(a),
          ],
          [0.004, 0.005, 0.005],
          black,
        );
      }
    }
  }
  // Wheels: deep polished barrels, five tapered spokes, bolted lips and brakes.
  for (const s of [-1, 1])
    for (const z of [-1.39, 1.37]) {
      const center = new T.Vector3(s * 0.98, 0.46, z),
        steer = z > 0 ? -0.3 : 0;
      const wm = new T.Matrix4().compose(
        center,
        new T.Quaternion().setFromEuler(new T.Euler(0, steer, s * -0.035)),
        new T.Vector3(1, 1, 1),
      );
      const wheel = (g, m, p = [0, 0, 0], r = [0, 0, 0]) => {
        g.applyMatrix4(
          new T.Matrix4().compose(
            new T.Vector3(...p),
            new T.Quaternion().setFromEuler(new T.Euler(...r)),
            new T.Vector3(1, 1, 1),
          ),
        );
        g.applyMatrix4(wm);
        add(g, m);
      };
      wheel(
        new T.CylinderGeometry(0.455, 0.455, 0.285, 48, 1, true),
        rubber,
        [0, 0, 0],
        [0, 0, Math.PI / 2],
      );
      for (const x of [-0.134, 0.134])
        wheel(
          new T.TorusGeometry(0.395, 0.055, 10, 48),
          rubber,
          [x, 0, 0],
          [0, Math.PI / 2, 0],
        );
      wheel(
        new T.CylinderGeometry(0.35, 0.35, 0.29, 48, 1, true),
        chrome,
        [0, 0, 0],
        [0, 0, Math.PI / 2],
      );
      wheel(
        new T.CylinderGeometry(0.265, 0.265, 0.018, 40),
        chrome,
        [s * 0.045, 0, 0],
        [0, 0, Math.PI / 2],
      );
      wheel(new T.BoxGeometry(0.045, 0.17, 0.08), amber, [
        s * 0.07,
        0.05,
        -0.21,
      ]);
      wheel(
        new T.CylinderGeometry(0.321, 0.321, 0.025, 40),
        black,
        [s * 0.085, 0, 0],
        [0, 0, Math.PI / 2],
      );
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        const sh = new T.Shape();
        sh.moveTo(-0.043, 0.045);
        sh.lineTo(-0.05, 0.285);
        sh.lineTo(0.026, 0.322);
        sh.lineTo(0.055, 0.29);
        sh.lineTo(0.038, 0.045);
        const g = new T.ExtrudeGeometry(sh, {
          depth: 0.026,
          bevelEnabled: true,
          bevelSize: 0.008,
          bevelThickness: 0.008,
          bevelSegments: 2,
          steps: 1,
        });
        g.rotateZ(a);
        g.rotateY((s * Math.PI) / 2);
        wheel(g, rim, [s * 0.101, 0, 0]);
      }
      wheel(
        new T.TorusGeometry(0.349, 0.013, 8, 64),
        chrome,
        [s * 0.155, 0, 0],
        [0, Math.PI / 2, 0],
      );
      wheel(
        new T.CylinderGeometry(0.066, 0.066, 0.035, 24),
        chrome,
        [s * 0.134, 0, 0],
        [0, 0, Math.PI / 2],
      );
      for (let i = 0; i < 28; i++) {
        const a = (i * Math.PI * 2) / 28;
        wheel(new T.SphereGeometry(0.008, 6, 4), chrome, [
          s * 0.151,
          0.326 * Math.sin(a),
          0.326 * Math.cos(a),
        ]);
      }
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        wheel(new T.SphereGeometry(0.012, 8, 6), black, [
          s * 0.154,
          0.091 * Math.sin(a),
          0.091 * Math.cos(a),
        ]);
      }
    }
  // Front bumper: a built surround, not a solid block covering the openings.
  box([0, 0.715, 2.245], [1.81, 0.18, 0.17], paint);
  box([0, 0.27, 2.27], [1.87, 0.105, 0.24], paint);
  box([0, 0.212, 2.31], [1.87, 0.025, 0.25], black);
  box([0, 0.462, 2.238], [0.83, 0.32, 0.055], black);
  box([0, 0.46, 2.277], [0.76, 0.27, 0.035], chrome);
  for (let i = 0; i < 11; i++)
    box([0, 0.338 + i * 0.023, 2.304], [0.75, 0.008, 0.018], black);
  for (const s of [-1, 1]) {
    box([s * 0.46, 0.45, 2.27], [0.095, 0.36, 0.22], paint);
    box([s * 0.895, 0.445, 2.19], [0.13, 0.42, 0.27], paint);
    box([s * 0.686, 0.435, 2.245], [0.34, 0.27, 0.035], black);
    for (let i = 0; i < 10; i++)
      box(
        [s * 0.686 - 0.15 + i * 0.033, 0.43, 2.27],
        [0.007, 0.23, 0.01],
        seam,
      );
    cylinder([s * 0.685, 0.46, 2.285], 0.067, 0.025, amber);
    box([s * 0.684, 0.306, 2.286], [0.32, 0.055, 0.05], paint);
    box([s * 0.335, 0.694, 2.342], [0.2, 0.065, 0.01], black);
    // R33 rounded headlamp housings and twin reflectors.
    add(new RoundedBoxGeometry(0.565, 0.145, 0.06, 4, 0.033), black, [
      s * 0.611,
      0.869,
      2.285,
    ]);
    add(new RoundedBoxGeometry(0.539, 0.119, 0.014, 4, 0.025), glass, [
      s * 0.611,
      0.87,
      2.319,
    ]);
    for (const x of [0.47, 0.66]) {
      cylinder([s * x, 0.87, 2.33], 0.045, 0.008, lens);
      cylinder([s * x, 0.87, 2.336], 0.03, 0.006, chrome);
    }
    box([s * 0.812, 0.87, 2.328], [0.056, 0.075, 0.013], lens);
  }
  box([0, 0.876, 2.221], [0.56, 0.115, 0.035], black);
  box([0, 0.818, 2.24], [0.63, 0.024, 0.06], paint);
  box([0, 0.886, 2.253], [0.027, 0.084, 0.012], chrome);
  flat([0, 0.655, 2.362], 0.43, 0.23, plate);
  flat([0, 0.271, 2.404], 0.86, 0.095, slogan, [-0.12, 0, 0]);
  // Windshield header and wipers sit on the sloped glass.
  flat([0, 1.478, 0.49], 1.31, 0.145, banner, [-0.965, 0, 0]);
  tube(
    [
      [-0.7, 1.065, 1.052],
      [-0.28, 1.11, 0.97],
      [0.01, 1.105, 0.99],
    ],
    0.01,
    black,
  );
  tube(
    [
      [0.1, 1.08, 1.04],
      [0.45, 1.105, 0.975],
      [0.67, 1.095, 0.99],
    ],
    0.01,
    black,
  );
  // Rear end, circular lamps and continuous smoked trim.
  box([0, 0.44, -2.22], [1.82, 0.35, 0.21], paint);
  box([0, 0.78, -2.245], [1.77, 0.3, 0.045], paint);
  box([0, 0.65, -2.278], [1.76, 0.055, 0.025], lens);
  for (const s of [-1, 1])
    for (const x of [0.53, 0.765]) {
      cylinder([s * x, 0.817, -2.28], 0.096, 0.022, chrome);
      cylinder([s * x, 0.817, -2.297], 0.081, 0.018, black);
      cylinder([s * x, 0.817, -2.308], 0.068, 0.022, red);
      cylinder([s * x, 0.817, -2.324], 0.042, 0.008, red);
    }
  cylinder([0, 0.825, -2.29], 0.026, 0.012, chrome);
  box([0, 0.463, -2.345], [0.48, 0.25, 0.012], black);
  flat([0, 0.464, -2.356], 0.43, 0.23, plate, [0, Math.PI, 0]);
  flat(
    [0, 0.65, -2.297],
    0.58,
    0.04,
    decal("S K Y L I N E", 0.58, 0.04, {
      color: "#d5d8d8",
      font: "45px Arial",
    }),
    [0, Math.PI, 0],
  );
  cylinder([-0.65, 0.245, -2.39], 0.104, 0.29, chrome);
  cylinder([-0.65, 0.245, -2.54], 0.087, 0.005, black);
  // Tall wing with shaped end pedestals, oval dark inserts and black blade.
  for (const s of [-1, 1]) {
    const sh = new T.Shape();
    sh.moveTo(-2.18, 0.965);
    sh.bezierCurveTo(-2.18, 1.13, -2.27, 1.45, -2.16, 1.46);
    sh.bezierCurveTo(-2.01, 1.46, -1.68, 1.24, -1.65, 1.02);
    sh.lineTo(-1.95, 0.965);
    sh.closePath();
    const g = new T.ExtrudeGeometry(sh, {
      depth: 0.072,
      bevelEnabled: true,
      bevelSize: 0.014,
      bevelThickness: 0.014,
      bevelSegments: 3,
      steps: 1,
    });
    g.rotateY(-Math.PI / 2);
    add(g, paint, [s * 0.825 + 0.036, 0, 0]);
    ball([s * 0.87, 1.335, -2.03], [0.009, 0.065, 0.153], black);
  }
  box([0, 1.407, -2.065], [1.69, 0.065, 0.28], paint, [-0.06, 0, 0]);
  box([0, 1.448, -2.065], [1.59, 0.019, 0.255], black, [-0.06, 0, 0]);
  // Visible cabin furnishings behind the dark glazing.
  for (const s of [-1, 1]) {
    ball([s * 0.42, 1.04, -0.12], [0.21, 0.28, 0.16], black);
    ball([s * 0.42, 1.27, -0.16], [0.14, 0.14, 0.1], black);
  }
  box([0, 1.025, 0.67], [1.49, 0.14, 0.28], black);
  add(
    new T.TorusGeometry(0.14, 0.018, 8, 24),
    black,
    [0.43, 1.12, 0.5],
    [-0.5, 0, 0],
  );
  const group = new T.Group();
  group.name = "BRUH • R33 Skyline GTS-T • photo-reference recreation";
  for (const [material, geos] of buckets) {
    const geometry = mergeGeometries(geos);
    geometry.computeBoundingSphere();
    const mesh = new T.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    group.add(mesh);
    geos.forEach((g) => g.dispose());
  }
  return group;
}
export default function Car() {
  const car = useMemo(createBruhSkyline, []);
  useEffect(
    () => () =>
      car.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          o.material.map?.dispose();
          o.material.dispose();
        }
      }),
    [car],
  );
  return <primitive object={car} />;
}
