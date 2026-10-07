# Built2Slide 3D Lab

Independent visual R&D project. All files, dependencies and Git history live in this directory. The surrounding Built2Slide website is not a dependency and must remain untouched.

## Run

Requires Node.js 22.12+ and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:5186. For an optimised build, use `pnpm build`, then `pnpm preview`. History routes need an index.html fallback on any future static host. Nothing is deployed by this project.

## Scope

- `/`: four-concept selector.
- `/drift-line`: working first-pass cinematic scene.
- `/garage`, `/touge`, `/sticker-wall`: navigable review gates, deliberately not implemented.

Stop at Drift Line until the owner has visually reviewed it.

## Interaction

Scroll or swipe vertically to progress the drift. Pointer movement subtly changes the camera and viewing angle, including touch movement. Replay returns to the beginning. Pause Smoke freezes ambient smoke movement; scrolling still advances the sequence. Reduced-motion preference disables ambient smoke and pointer movement. Quality Auto uses lower settings on small screens, low-core devices, or an initial frame-rate sample below 28 fps. Low uses DPR 1, 26 smoke planes and no shadows; desktop uses DPR capped at 1.5 and 58 smoke planes. If WebGL fails, the photographic fallback and page navigation remain available.

## Organisation

`src/concepts/drift-line/` owns the experiment. `src/scene/` contains shared header, photo-reference R33 model and orbit viewer. `src/animation/trajectory.js` defines the curve shared by the car and tyre marks. `src/shaders/` contains the bounded smoke shader. New concepts should have independent directories and lazy route imports.

`public/assets/` has separate folders for brand, photographs, models, textures, stickers, merchandise and events. See its asset manifest. The car is a stylised, code-built reconstruction of the supplied white BRUH R33 Skyline GTS-T. It is not a scan or a dimensionally exact replica. It includes front/rear NSW plates, wide riveted arches, five-spoke polished-lip wheels, intercooler bumper, windshield banner and rear wing. Fine decals and some body contours remain approximations. Static geometry is batched by material. Asphalt and smoke are procedural. No external car model or invented brand history is used. A genuine GLB model can later replace `Car.jsx`; orient its nose along +Z, with ground at Y=0 and length approximately 4.5 units.

The original attached photos remain unmodified. Five selected photos and the logo are copied locally for this first pass. The remaining attachments are reference material, not automatically loaded into the experience. Barlow and Barlow Condensed are bundled locally using Fontsource, with no external font requests.

## Verification and recovery

`pnpm test` checks the trajectory contract. `node scripts/browser-check.mjs` tests desktop and mobile routes, scroll progression, controls, reduced motion and WebGL fallback against a running dev/preview server, saving screenshots under `.preview/`.

The initial stable commit is tagged `lab-v0.1-drift-line`. To inspect or restore it, use Git from this directory only. Do not run recovery commands in the parent repository.

This is a visual prototype. No checkout, backend, analytics, racing controls or production integration is included.

Use **View BRUH** in the scene controls to open the car viewer. Drag to orbit, scroll/pinch to zoom, or select Front / Side / Rear. Close or Escape returns to the drift scene. Run `node scripts/check-bruh.mjs` to verify the desktop/mobile viewer and save its three-angle screenshots.
