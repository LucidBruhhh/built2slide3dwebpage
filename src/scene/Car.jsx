import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

export default function Car() {
  const gltf = useLoader(GLTFLoader, "/assets/models/bruh.glb");
  const model = useMemo(() => {
    const root = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 4.55 / size.z;
    // Uploaded mesh has a slight nose-up pitch and off-centre wheelbase.
    // Align the measured tyre contact points and centre the two axles.
    root.rotation.x = 0.031;
    root.position.set(-center.x * scale, -0.00744 * scale, -0.0475 * scale);
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
