import React, { useMemo } from "react";
import * as THREE from "three";
function Panel({ points, depth, material }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    points.forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y)));
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.045,
      bevelSegments: 2,
      steps: 1,
    });
    g.rotateY(-Math.PI / 2);
    g.translate(depth / 2, 0, 0);
    return g;
  }, [depth, points]);
  return <mesh geometry={geo} material={material} castShadow />;
}
const bodyShape = [
  [-2.2, 0.53],
  [-2.25, 0.85],
  [-1.8, 1.03],
  [-0.9, 1.07],
  [0.8, 1.01],
  [2.12, 0.89],
  [2.22, 0.57],
  [1.8, 0.46],
  [-1.8, 0.46],
];
const cabinShape = [
  [-1.38, 1.04],
  [-0.72, 1.65],
  [0.48, 1.65],
  [1.18, 1.04],
];
function Box({ position, scale, material, rotation }) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={rotation}
      material={material}
      castShadow
    >
      <boxGeometry />
    </mesh>
  );
}
function Wheel({ x, z, front, spin = 0 }) {
  return (
    <group
      position={[x, 0.5, z]}
      rotation={[0, front ? -0.43 : 0, x > 0 ? -0.055 : 0.055]}
    >
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.3, 24]} />
        <meshStandardMaterial color="#151615" roughness={0.97} />
      </mesh>
      <mesh
        position={[x > 0 ? 0.162 : -0.162, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <torusGeometry args={[0.335, 0.035, 8, 32]} />
        <meshStandardMaterial
          color="#b1b5b3"
          metalness={0.9}
          roughness={0.27}
        />
      </mesh>
      <group position={[x > 0 ? 0.17 : -0.17, 0, 0]} rotation={[spin, 0, 0]}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh
            key={i}
            rotation={[(i * Math.PI) / 3, 0, 0]}
            position={[0, 0, 0]}
          >
            <boxGeometry args={[0.035, 0.6, 0.046]} />
            <meshStandardMaterial
              color="#777f7b"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.36, 12]} />
        <meshStandardMaterial
          color="#a5a6a0"
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
export default function Car() {
  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: "#a8aaa4",
        metalness: 0.72,
        roughness: 0.32,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: "#101b1e",
        metalness: 0.65,
        roughness: 0.16,
      }),
      black: new THREE.MeshStandardMaterial({
        color: "#171917",
        roughness: 0.72,
      }),
      red: new THREE.MeshStandardMaterial({
        color: "#6b1510",
        emissive: "#b21e10",
        emissiveIntensity: 1.3,
      }),
      light: new THREE.MeshStandardMaterial({
        color: "#dad9bd",
        emissive: "#ede8c9",
        emissiveIntensity: 1.1,
      }),
    }),
    [],
  );
  return (
    <group>
      <Panel points={bodyShape} depth={1.86} material={materials.body} />
      <Panel points={cabinShape} depth={1.56} material={materials.glass} />
      <Box
        position={[0, 1.68, -0.12]}
        scale={[1.61, 0.065, 1.27]}
        material={materials.body}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[side * 0.8, 1.36, 0.57]}
            scale={[0.065, 0.67, 0.065]}
            rotation={[0.72, 0, 0]}
            material={materials.body}
          />
          <Box
            position={[side * 0.8, 1.36, -1.03]}
            scale={[0.065, 0.81, 0.065]}
            rotation={[-0.8, 0, 0]}
            material={materials.body}
          />
          <Box
            position={[side * 0.8, 1.36, -0.35]}
            scale={[0.065, 0.63, 0.08]}
            material={materials.body}
          />
          <Box
            position={[side * 0.97, 0.49, 0]}
            scale={[0.09, 0.14, 3.4]}
            material={materials.black}
          />
          <Box
            position={[side * 1.06, 1.05, 0.72]}
            scale={[0.27, 0.15, 0.3]}
            material={materials.body}
          />
          <Box
            position={[side * 0.54, 0.84, 2.19]}
            scale={[0.58, 0.16, 0.055]}
            material={materials.light}
          />
          <Box
            position={[side * 0.56, 0.83, -2.21]}
            scale={[0.6, 0.18, 0.055]}
            material={materials.red}
          />
          <Box
            position={[side * 0.59, 1.13, -1.92]}
            scale={[0.05, 0.55, 0.12]}
            material={materials.black}
          />
          <Wheel x={side * 0.97} z={1.37} front />
          <Wheel x={side * 0.97} z={-1.39} />
        </group>
      ))}
      <Box
        position={[0, 1.42, -1.96]}
        scale={[2.2, 0.085, 0.43]}
        material={materials.black}
      />
      <Box
        position={[0, 0.55, 2.23]}
        scale={[1.85, 0.12, 0.14]}
        material={materials.black}
      />
      <Box
        position={[0, 0.69, 2.241]}
        scale={[0.85, 0.18, 0.03]}
        material={materials.black}
      />
      <Box
        position={[0, 1.039, 1.48]}
        scale={[0.9, 0.025, 0.42]}
        material={materials.black}
      />
      <Box
        position={[0, 0.73, -2.26]}
        scale={[0.45, 0.15, 0.025]}
        material={materials.black}
      />
    </group>
  );
}
