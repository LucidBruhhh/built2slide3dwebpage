# Review audit — 7 October 2026

Status: functional review version; NOT certified as a perfect 1:1 car replica. Owner explicitly approved backing up this review version after being told about the remaining fidelity issues.

## Fixed and reviewed
- Hero wording: Life is too boring to drive in a straight line.
- Jim's Drifting door graphic suppressed in colour and surface response.
- Separate front/rear wheel fitment, deeper rear wheel face recess, independent steering/spin. Original source GLBs preserved.
- Repeated rear/side/front visual checks. Retained original tyre diameter after the smaller replacement revealed source mesh edges. Narrowed front spacing independently of rear spacing.
- Readable replacement rear NSW BRUH plate, fitted ahead of the existing distorted plate surface using raycast samples.
- Straight rear, rear three-quarter and opposite-side viewer presets.
- Wheel parts batched by material to reduce draw calls.
- Visible loading state and error fallback; fixed error overlay intercepting controls.
- Viewer demand rendering; main scene stops behind viewer/offscreen/hidden tab. Reduced-motion camera and car remain static.
- Variable drift slip, staged camera and motion-linked smoke.

## Validation
- pnpm test: trajectory continuity and heading.
- scripts/browser-check.mjs: desktop/mobile navigation, WebGL, scroll phases, controls, replay, overflow and fallback.
- scripts/check-bruh.mjs: desktop/mobile viewer angles, close, Escape and reopen.
- scripts/audit-resilience.mjs: delayed loading, failed model loading, closing failed viewer, pixel-identical reduced-motion canvas before/after scrolling (drawing buffer preserved only by the test harness).
- Production build checked separately. Three.js bundle-size warning is expected; mobile hardware FPS has not been measured.

## Fidelity audit — still open
- Generated single-mesh source has uneven flare/body surfaces and distorted rear-window/wing lettering. Runtime wheel replacement cannot reconstruct missing scanned geometry.
- Rear plate is a clean typographic approximation, not original plate artwork.
- Wheel offsets, tyre dimensions, lip depth and camber are visually estimated; physical measurements have not been supplied.
- Source tyre/fender boundary can still show artifacts in close views and steering poses. No claim of perfect panel clearance at every steering angle.
- Original decal vector artwork is needed for literal 1:1 typography. The additional 4WD photo provides a Modified Mafia script reference only, not Skyline body geometry.

## Background: proposal only
`review/cedar-background-concept.png` is an AI-assisted paintover of the actual renderer's initial composition. It is not a screenshot of an implemented photorealistic environment and is not evidence of car dimensional accuracy.

`/drift-line?environment=cedar-preview` is an optional coarse geometry/layout study using the existing drift path. It is disabled on the default route. Trees, terrain and rails are placeholders. The road is offset outward to avoid folding inside the tight ellipse. Detailed scenery requires a separate approved implementation and camera/clearance verification through the entire sequence.

The ordinary `/drift-line` remains the default asphalt scene. No deployment or production-site modification is included.
