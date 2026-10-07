# BRUH replacement model comparison

2026-10-07. Reviewed independently by two agents, using source GLBs rendered at equal length, camera positions and lighting. Active model: **candidate A**.

| Upload                    | Source copy     |             Size | Triangles | Texture maps                            | Result                                                                           |
| ------------------------- | --------------- | ---------------: | --------: | --------------------------------------- | -------------------------------------------------------------------------------- |
| First: white modified car | candidate-a.glb | 13,399,688 bytes |   341,422 | Base colour, normal, metallic/roughness | Selected: clearer windows, lights, BRUH markings and smoother overall appearance |
| Second: modified car      | candidate-b.glb | 27,873,632 bytes |   850,222 | Base colour                             | More geometry, but flatter shading and visible faceting                          |
| Third: white modified car | Same as A       | 13,399,688 bytes |   341,422 | Same as A                               | Byte-identical duplicate verified by SHA-256                                     |

A SHA-256: ACCFA186D76B1DAE427E5838FC6EC5CBEC647872C189A6D1C65EA03EF3FF4315

B SHA-256: FD4845A836B53A86C1A1FD905682FD9FE4258084B94DD03CE7A637F4D3B438E6

## Web derivative

`node scripts/prepare-bruh.mjs` now generates `public/assets/models/bruh-v2.glb` from candidate A. Result: 7,365,624 bytes and 129,739 triangles. All embedded texture images are retained unchanged. Original-versus-optimised renders were visually compared at matching views; the major silhouette, markings and lights remain intact. This is a visual check, not a claim of lossless geometry.

Calibration lives in `src/scene/vehicleConfig.js`: rotate the +X-facing source to +Z, level the measured front/rear tyre contact points and normalise length to 4.55 units. Smoke and tyre tracks now use the same rear axle and track-width values. Generated asymmetry remains possible; calibration is approximate.

## Remaining limitations

Both new files contain one combined mesh and material. Wheels cannot independently spin or countersteer without mesh separation. A has a curved dark dangling shape below the rear, apparently a reconstruction of the hanging accessory; it remains in the source and derivative. Fine lettering, local dents and glass remain generated approximations.

The previous original and web model remain available for recovery. This update does not implement the broader audit proposals for camera choreography, loading UI, hidden-canvas suspension or wheel animation.
