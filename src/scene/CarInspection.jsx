import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import SceneBoundary, { ModelLoading } from "./SceneBoundary.jsx";
import Car from "./Car.jsx";
const angles = { FRONT: [5, 2.7, 7], SIDE: [7, 1.8, 0], REAR: [0, 1.35, -8], "REAR 3/4": [-5, 2.6, -7], "OTHER SIDE": [-7, 1.8, 0] };
function Controls({ angle }) {
  const { camera, gl, invalidate, size } = useThree();
  const control = useRef();
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement);
    c.target.set(0, 0.8, 0);
    c.enableDamping = true;
    c.minDistance = 4;
    c.maxDistance = 22;
    c.maxPolarAngle = Math.PI * 0.49;
    c.addEventListener("change", invalidate);
    control.current = c;
    return () => c.dispose();
  }, [camera, gl, invalidate]);
  useEffect(() => {
    camera.position.set(...angles[angle]);
    camera.position.multiplyScalar(Math.max(1, 0.95 / camera.aspect));
    control.current?.update();
  }, [angle, camera, size.width, size.height]);
  useFrame(() => control.current?.update());
  return null;
}
export default function CarInspection({ onClose, quality }) {
  const [angle, setAngle] = useState("FRONT");
  const dialog = useRef();
  const [ready, setReady] = useState(false);
  const low =
    quality === "low" ||
    (quality !== "high" &&
      (innerWidth < 700 || navigator.hardwareConcurrency <= 4));
  useEffect(() => {
    const d = dialog.current;
    d.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="car-inspection"
      onCancel={onClose}
      aria-labelledby="car-title"
    >
      <div className="inspection-title">
        <div>
          <p className="eyebrow">THE CAR BEHIND THE LINE</p>
          <h2 id="car-title">
            BRUH <span>R33 SKYLINE GTS-T</span>
          </h2>
        </div>
        <button autoFocus onClick={onClose} aria-label="Close car viewer">
          CLOSE ×
        </button>
      </div>
      <div className="inspection-canvas">
        {!ready && <ModelLoading />}
        <SceneBoundary>
          <Canvas
            frameloop="demand"
            fallback={
              <div className="scene-fallback" role="status">
                3D unavailable. Close to return to the photographs.
              </div>
            }
            shadows={!low}
            camera={{ position: angles.FRONT, fov: 37 }}
            dpr={low ? 1 : [1, 1.5]}
          >
            <color attach="background" args={["#272c2e"]} />
            <hemisphereLight args={["#ffffff", "#64605b", 2]} />
            <directionalLight
              position={[3, 7, 5]}
              intensity={3.5}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <directionalLight position={[-5, 3, -6]} intensity={2.7} />
            <Suspense fallback={null}>
              <Car onReady={() => setReady(true)} />
            </Suspense>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.005, 0]}
              receiveShadow
            >
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color="#272c2e" roughness={0.9} />
            </mesh>
            <Controls angle={angle} />
          </Canvas>
        </SceneBoundary>
      </div>
      <div className="inspection-bottom">
        <div>
          {Object.keys(angles).map((a) => (
            <button
              key={a}
              aria-pressed={angle === a}
              onClick={() => setAngle(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <p>
          Drag to orbit · Scroll to zoom
          <br />
          <small>Your uploaded BRUH model.</small>
        </p>
      </div>
    </dialog>
  );
}
