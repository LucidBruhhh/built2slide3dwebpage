import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import { vehicleConfig as vehicle } from "./vehicleConfig.js";

export default function Car() {
  const gltf = useLoader(GLTFLoader, vehicle.url);
  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = vehicle.length / Math.max(size.x, size.z);
    root.rotation.set(vehicle.pitch, vehicle.yaw, 0);
    root.position.set(
      center.z * scale,
      -vehicle.contactHeight * scale,
      -center.x * scale,
    );
    root.scale.setScalar(scale);
    root.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = false;
      }
    });
    return root;
  }, [gltf]);
  return <primitive object={model} />;
}
