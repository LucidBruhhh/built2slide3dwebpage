# Cedar environment implementation — 7 October 2026

Approved cedar mountain-road direction is now active on `/drift-line`. The car, drift trajectory, hero wording and viewer are retained.

This is a browser-rendered hybrid: 3D road/guardrail/terrain/rocks, crossed alpha-tested cedar foliage cards, and a generated panoramic valley backdrop. It is not the prior concept image pasted behind the car, and does not claim to reproduce every photorealistic detail of that concept. Background trees and distant mountains do not require downloading a large Unreal level.

- Generated PNGs: `public/assets/textures/cedar-valley.png` and `cedar-tree.png`, ~5.2 MB combined. No remote asset request at runtime.
- Road uses the same ellipse as the car and extends past both animation endpoints. Outward offset prevents inner-edge folding.
- Road, posts, amber reflectors and slopes provide motion parallax. Repeated foliage/rocks/posts use instancing; low quality reduces tree count.
- Previous asphalt presentation: `/drift-line?environment=asphalt`.
- Existing car fidelity limitations in AUDIT.md still apply.

Validation: four unit tests pass (trajectory/heading plus road alignment, upward normals and all tyre contact points on pavement over 201 drift samples); desktop/mobile browser checks, model-loading/error/reduced-motion checks, and production build pass. Entry/middle/exit screenshots reviewed at 1440x960 and 390x844. These are browser automation checks, not physical mobile GPU benchmarking. Existing Three.js bundle size warning remains.

The old `cedar-background-concept.png` remains the historical proposed art direction. `cedar-implemented-desktop.png` and `cedar-implemented-mobile.png` are actual browser captures of this implementation.
