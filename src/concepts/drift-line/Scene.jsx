import CedarEnvironment from "./CedarEnvironment.jsx";
import React, { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  driftAngle,
  driftStrength,
  shot,
} from "../../animation/choreography.js";
import Car from "../../scene/Car.jsx";
import { vehicleConfig as vehicle } from "../../scene/vehicleConfig.js";
import { trajectory, heading, clamp } from "../../animation/trajectory.js";
import { smokeVertex, smokeFragment } from "../../shaders/smoke.js";
const shadowFragment = `varying vec2 vUv;void main(){float a=smoothstep(.52,.12,length(vUv-.5))*.6;gl_FragColor=vec4(.01,.015,.012,a);}`;
function asphaltTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const im = ctx.createImageData(256, 256);
  let seed = 37;
  for (let i = 0; i < im.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = 45 + (seed % 35);
    im.data[i] = v;
    im.data[i + 1] = v;
    im.data[i + 2] = v - 2;
    im.data[i + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(32, 32);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function makeLine(offset = 0, width = 0.08) {
  const vertices = [],
    uv = [],
    indices = [];
  for (let i = 0; i <= 180; i++) {
    const t = i / 180;
    const p = trajectory(t),
      yaw = heading(t) + driftAngle(t);
    const rear = [
      p[0] - Math.sin(yaw) * vehicle.rearAxleDistance + Math.cos(yaw) * offset,
      0.025,
      p[2] - Math.cos(yaw) * vehicle.rearAxleDistance - Math.sin(yaw) * offset,
    ];
    for (const side of [-1, 1]) {
      vertices.push(
        rear[0] + Math.cos(yaw) * width * side,
        rear[1],
        rear[2] - Math.sin(yaw) * width * side,
      );
      uv.push(t, (side + 1) / 2);
    }
    if (i < 180) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function Tracks({ current }) {
  const geometries = useMemo(
    () => [-vehicle.halfTrack, vehicle.halfTrack].map((o) => makeLine(o, 0.13)),
    [],
  );
  const refs = useRef([]);
  useFrame(() => {
    refs.current.forEach((mesh) =>
      mesh.geometry.setDrawRange(0, Math.floor(current.current * 180) * 6),
    );
  });
  return (
    <>
      {geometries.map((geo, i) => (
        <mesh ref={(r) => (refs.current[i] = r)} key={i} geometry={geo}>
          <meshBasicMaterial
            color="#070908"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}
function Guide() {
  const geo = useMemo(() => makeLine(0, 0.025), []);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        color="#c0bda9"
        transparent
        opacity={0.31}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
function Smoke({ current, low, paused, strength }) {
  const group = useRef(),
    time = useRef(0);
  const count = low ? 26 : 58;
  const uniforms = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        opacity: { value: 0 },
        seed: { value: i * 2.74 },
      })),
    [count],
  );
  useFrame((state, dt) => {
    if (!paused) time.current += Math.min(dt, 0.05);
    group.current.children.forEach((mesh, i) => {
      const age = (i / count + time.current * 0.12) % 1;
      const t = Math.max(0, current.current - age * 0.14);
      const p = trajectory(t),
        yaw = heading(t) + driftAngle(t),
        side = i % 2 ? 1 : -1;
      mesh.position.set(
        p[0] -
          Math.sin(yaw) * vehicle.rearAxleDistance +
          Math.cos(yaw) * side * vehicle.halfTrack +
          Math.sin(i * 7.2) * age * 0.8,
        0.3 + age * 1.4,
        p[2] -
          Math.cos(yaw) * vehicle.rearAxleDistance -
          Math.sin(yaw) * side * vehicle.halfTrack +
          age * 0.4,
      );
      mesh.quaternion.copy(state.camera.quaternion);
      mesh.rotateZ(i * 1.1 + age * 0.45);
      mesh.scale.setScalar(0.6 + age * 3.1);
      mesh.material.uniforms.opacity.value =
        Math.pow(Math.sin(age * Math.PI), 0.65) * 0.32 * strength.current;
    });
  });
  return (
    <group ref={group}>
      {uniforms.map((u, i) => (
        <mesh key={i}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            vertexShader={smokeVertex}
            fragmentShader={smokeFragment}
            uniforms={u}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
function World({ progress, pointer, low, paused, reduced, onReady }) {
  const cedar = new URLSearchParams(location.search).get("environment") !== "asphalt";
  const car = useRef(),
    current = useRef(0),
    strength = useRef(0),
    motion = useRef({ progress: 0, slip: 0 });
  const tex = useMemo(asphaltTexture, []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, dt) => {
    const previous = current.current;
    current.current = reduced
      ? 0
      : THREE.MathUtils.damp(
          current.current,
          progress.current,
          5,
          Math.min(dt, 0.05),
        );
    const t = current.current,
      p = trajectory(t),
      wide = state.size.width > 700;
    car.current.position.set(...p);
    const yaw = heading(t) + driftAngle(t),
      frame = shot(t);
    car.current.rotation.set(0, yaw, 0);
    motion.current = { progress: t, slip: reduced ? 0 : driftAngle(t) };
    strength.current = reduced
      ? 0
      : THREE.MathUtils.damp(
          strength.current,
          Math.min(1, (Math.abs(t - previous) / Math.max(dt, 0.001)) * 24) *
            driftStrength(t),
          3,
          dt,
        );
    const px = reduced ? 0 : pointer.current.x,
      py = reduced ? 0 : pointer.current.y;
    const distance = wide ? frame.distance : 10.5;
    desired.set(
      p[0] + Math.sin(yaw + frame.azimuth) * distance + px * 0.15,
      wide ? frame.height : 5.7,
      p[2] + Math.cos(yaw + frame.azimuth) * distance + py * 0.1,
    );
    if (reduced) state.camera.position.copy(desired);
    else state.camera.position.lerp(desired, 1 - Math.exp(-dt * 4));
    target.set(
      p[0] - (wide ? 2.2 * (1 - Math.min(1, t * 3)) : 0),
      wide ? 0.7 : 2.05,
      p[2],
    );
    state.camera.lookAt(target);
  });
  return (
    <>
      <color attach="background" args={[cedar ? "#75898c" : "#181b19"]} />
      <fog attach="fog" args={[cedar ? "#75898c" : "#181b19", cedar ? 30 : 17, cedar ? 110 : 48]} />
      <hemisphereLight args={["#b9c3c8", "#302c21", 1.6]} />
      <directionalLight
        position={[5, 12, 4]}
        intensity={3}
        color="#e8e2cc"
        castShadow={!low}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-7, 4, -6]} intensity={2} color="#9babb4" />
      {!cedar && <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial map={tex} roughness={0.96} metalness={0.04} />
      </mesh>}
      {cedar ? <CedarEnvironment asphalt={tex} low={low} /> : <Guide />}
      <Tracks current={current} />
      <group ref={car}>
        <Car onReady={onReady} motion={motion} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <planeGeometry args={[2.6, 5.2]} />
          <shaderMaterial
            vertexShader={smokeVertex}
            fragmentShader={shadowFragment}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
      <Smoke
        current={current}
        low={low}
        paused={paused || reduced}
        strength={strength}
      />
      {!cedar && [-12, -6, 0, 6, 12].map((x) => (
        <mesh
          key={x}
          position={[x, 0.015, -10]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[3, 0.07]} />
          <meshBasicMaterial color="#7f7f6c" transparent opacity={0.3} />
        </mesh>
      ))}
    </>
  );
}
export default function Scene(props) {
  const [slow, setSlow] = useState(false);
  const low =
    props.quality === "low" ||
    (props.quality === "auto" &&
      (innerWidth < 700 || navigator.hardwareConcurrency <= 4 || slow));
  return (
    <Canvas
      frameloop={!props.active ? "never" : props.reduced ? "demand" : "always"}
      shadows={!low}
      dpr={low ? 1 : [1, 1.5]}
      camera={{ position: [8, 7, 12], fov: 43, near: 0.1, far: 220 }}
      gl={{ antialias: !low, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      fallback={
        <div className="scene-fallback">
          3D unavailable. Scroll to the photographic study.
        </div>
      }
    >
      <Suspense fallback={null}>
        <World {...props} low={low} />
        <Performance onSlow={() => setSlow(true)} />
      </Suspense>
    </Canvas>
  );
}
function Performance({ onSlow }) {
  const sample = useRef({ time: 0, frames: 0, done: false });
  useFrame((_, dt) => {
    const s = sample.current;
    if (s.done) return;
    s.time += dt;
    s.frames++;
    if (s.time > 5) {
      if (s.frames / s.time < 28) onSlow();
      s.done = true;
    }
  });
  return null;
}
