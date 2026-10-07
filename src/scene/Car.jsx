import { rearPlate } from "./rearDetails.js";
import React, { useMemo, useEffect, useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as T from "three";
import { vehicleConfig as vehicle } from "./vehicleConfig.js";
import { prepareBody, wheelGeometry } from "./customizeCar.js";
export default function Car({ onReady, motion }) {
  const gltf = useLoader(GLTFLoader, vehicle.url),
    previous = useRef(0);
  const model = useMemo(() => {
    const body = gltf.scene.clone(true);
    prepareBody(body);
    const bounds = new T.Box3().setFromObject(body),
      size = bounds.getSize(new T.Vector3()),
      center = bounds.getCenter(new T.Vector3()),
      scale = vehicle.length / Math.max(size.x, size.z);
    body.rotation.set(vehicle.pitch, vehicle.yaw, 0);
    body.position.set(
      center.z * scale,
      -vehicle.contactHeight * scale,
      -center.x * scale,
    );
    body.scale.setScalar(scale);
    body.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = false;
      }
    });
    const root = new T.Group();
    root.add(body);
    const plate=rearPlate(body); if(plate) root.add(plate);
    const wheels = [];
    for (const side of [-1, 1])
      for (const z of [-vehicle.rearAxleDistance, vehicle.rearAxleDistance]) {
        const pivot = new T.Group();
        const front = z > 0;
        const radiusScale = 1;
        pivot.position.set(side * (front ? 0.755 : 0.835), 0.402 * radiusScale, z);
        const wheel = wheelGeometry({ rear: z < 0 });
        wheel.scale.set(front ? 0.92 : 1, radiusScale, radiusScale);
        if (side < 0) wheel.rotation.y = Math.PI;
        pivot.add(wheel);
        root.add(pivot);
        wheels.push({ pivot, wheel, front: z > 0, side });
      }
    root.userData.wheels = wheels;
    return root;
  }, [gltf]);
  useEffect(() => {
    onReady?.();
  }, [model, onReady]);
  useFrame(() => {
    const t = motion?.current?.progress ?? 0,
      slip = motion?.current?.slip ?? 0,
      delta = t - previous.current;
    previous.current = t;
    for (const { pivot, wheel, front, side } of model.userData.wheels) {
      pivot.rotation.y = front ? -slip * 0.7 : 0;
      wheel.userData.spin.rotation.x += delta * 65 * side;
    }
  });
  useEffect(
    () => () =>
      model.traverse((n) => {
        if (n.isMesh) {
          n.geometry.dispose();
          n.material.dispose();
        }
      }),
    [model],
  );
  return <primitive object={model} />;
}
