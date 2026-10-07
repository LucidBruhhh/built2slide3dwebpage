import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import * as T from "three";
// Work in the unscaled source coordinates; preserve the cached GLB untouched.
export function prepareBody(root) {
  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const geo = mesh.geometry.clone(),
      p = geo.attributes.position,
      index = geo.index,
      kept = [];
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
      const x = ids.reduce((n, j) => n + p.getX(j), 0) / 3,
        y = ids.reduce((n, j) => n + p.getY(j), 0) / 3,
        z = ids.reduce((n, j) => n + p.getZ(j), 0) / 3;
      const wheel = [
        { x: 0.295, y: 0.088 },
        { x: -0.295, y: 0.102 },
      ].some(
        (c) => Math.hypot(x - c.x, y - c.y) < 0.078 && Math.abs(z) > 0.145,
      );
      if (!wheel) kept.push(...ids);
    }
    geo.setIndex(kept);
    mesh.geometry = geo;
    mesh.material = mesh.material.clone();
    mesh.material.onBeforeCompile = (shader) => {
      shader.vertexShader =
        "varying vec3 sourcePosition;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nsourcePosition=position;",
        );
      shader.fragmentShader =
        "varying vec3 sourcePosition;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
     float doorMask=(1.0-smoothstep(.056,.075,abs(sourcePosition.x-.025)))*(1.0-smoothstep(.045,.061,abs(sourcePosition.y-.167)))*smoothstep(.145,.16,abs(sourcePosition.z));
     diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.60),doorMask);
   `,
      );
      shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal=normalize(mix(normal,nonPerturbedNormal,doorMask));');
      shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.4,doorMask);');
      shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,.0,doorMask);');
    };
    mesh.material.customProgramCacheKey = () => "bruh-clean-door-v2";
  });
}
export function wheelGeometry({ rear = false } = {}) {
  const g = new T.Group();
  const rubber = new T.MeshStandardMaterial({
      color: "#101214",
      roughness: 0.88,
    }),
    metal = new T.MeshStandardMaterial({
      color: "#c3c8cd",
      metalness: 0.9,
      roughness: 0.2,
    }),
    dark = new T.MeshStandardMaterial({
      color: "#292b30",
      metalness: 0.65,
      roughness: 0.3,
    }),
    black = new T.MeshStandardMaterial({ color: "#111214", roughness: 0.7 }),
    gold = new T.MeshStandardMaterial({
      color: "#dcae23",
      metalness: 0.4,
      roughness: 0.4,
    });
  function add(geo, mat, pos = [0, 0, 0], rot = [0, 0, 0]) {
    const m = new T.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    g.add(m);
    return m;
  }
  add(
    new T.CylinderGeometry(0.402, 0.402, 0.24, 48, 1, true),
    rubber,
    [0, 0, 0],
    [0, 0, Math.PI / 2],
  );
  for (const x of [-0.115, 0.115])
    add(
      new T.TorusGeometry(0.351, 0.05, 12, 64),
      rubber,
      [x, 0, 0],
      [0, Math.PI / 2, 0],
    );
  add(
    new T.CylinderGeometry(0.307, 0.307, 0.245, 64, 1, true),
    metal,
    [0, 0, 0],
    [0, 0, Math.PI / 2],
  );
  add(
    new T.CylinderGeometry(0.246, 0.246, 0.012, 40),
    dark,
    [rear ? -0.115 : -0.04, 0, 0],
    [0, 0, Math.PI / 2],
  );
  add(new T.BoxGeometry(0.035, 0.14, 0.08), gold, [rear ? -0.07 : 0.005, 0.06, -0.19]);
  const spin = new T.Group();
  g.add(spin);
  const before = g.children.length;
  const faceOffset = rear ? -0.075 : 0;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const s = new T.Shape();
    s.moveTo(-0.038, 0.03);
    s.lineTo(-0.046, 0.255);
    s.lineTo(-0.012, 0.291);
    s.lineTo(0.038, 0.272);
    s.lineTo(0.034, 0.03);
    const geo = new T.ExtrudeGeometry(s, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 2,
      steps: 1,
    });
    geo.rotateZ(a);
    geo.rotateY(Math.PI / 2);
    add(geo, dark, [0.032 + faceOffset, 0, 0]);
  }
  add(
    new T.CylinderGeometry(0.05, 0.05, 0.032, 24),
    metal,
    [0.071 + faceOffset, 0, 0],
    [0, 0, Math.PI / 2],
  );
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    add(new T.SphereGeometry(0.009, 8, 6), black, [
      0.072 + faceOffset,
      0.071 * Math.sin(a),
      0.071 * Math.cos(a),
    ]);
  }
  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI * 2) / 32;
    add(new T.SphereGeometry(0.0055, 6, 4), metal, [
      0.13,
      0.293 * Math.sin(a),
      0.293 * Math.cos(a),
    ]);
  }
  add(
    new T.TorusGeometry(0.309, 0.01, 8, 64),
    metal,
    [0.13, 0, 0],
    [0, Math.PI / 2, 0],
  );
  [...g.children].slice(before).forEach((m) => spin.attach(m));
  batchMeshes(g); batchMeshes(spin);
  g.userData.spin = spin;
  return g;
}


function batchMeshes(group) {
  const batches=new Map();
  for(const child of [...group.children]){
    if(!child.isMesh) continue;
    child.updateMatrix();
    const geo=child.geometry.index ? child.geometry.toNonIndexed() : child.geometry.clone();
    geo.applyMatrix4(child.matrix);
    if(!batches.has(child.material)) batches.set(child.material,[]);
    batches.get(child.material).push(geo);
    child.geometry.dispose();group.remove(child);
  }
  for(const [mat,geos] of batches){const merged=mergeGeometries(geos);geos.forEach(g=>g.dispose());const m=new T.Mesh(merged,mat);m.castShadow=true;group.add(m);}
}


