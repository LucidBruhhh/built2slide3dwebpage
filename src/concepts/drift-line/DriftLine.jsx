import React, {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
} from "react";
import Header from "../../scene/Header.jsx";
import { clamp } from "../../animation/trajectory.js";
const Scene = lazy(() => import("./Scene.jsx"));
class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <p>
          3D is unavailable on this device.
          <br />
          Explore the photographic study below.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function DriftLine() {
  const progress = useRef(0),
    pointer = useRef({ x: 0, y: 0 });
  const [pct, setPct] = useState(0),
    [quality, setQuality] = useState("auto"),
    [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    const update = () => {
      progress.current = clamp(scrollY / (innerHeight * 2.5));
      setPct(Math.round(progress.current * 100));
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      media.removeEventListener("change", change);
    };
  }, []);
  const phase =
    pct < 32 ? "INITIATION" : pct < 70 ? "HOLD THE ANGLE" : "FOLLOW THE LINE";
  return (
    <div className="drift-page">
      <Header />
      <div className="cinematic-scroll">
        <div
          className="cinematic"
          onPointerMove={(e) => {
            pointer.current = {
              x: (e.clientX / innerWidth) * 2 - 1,
              y: (e.clientY / innerHeight) * 2 - 1,
            };
          }}
          onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
        >
          <div className="scene">
            <SceneBoundary>
              <Suspense
                fallback={<div className="loading">SETTING THE SCENE…</div>}
              >
                <Scene
                  progress={progress}
                  pointer={pointer}
                  quality={quality}
                  paused={paused || reduced}
                />
              </Suspense>
            </SceneBoundary>
          </div>
          <div className="scene-grain" />
          <div className="hero-copy" style={{ opacity: 1 - pct / 145 }}>
            <p className="eyebrow">CONCEPT 01 / THE DRIFT LINE</p>
            <h1>
              NEVER
              <br />
              STRAIGHT.
            </h1>
            <p className="hero-description">
              A little less grip.
              <br />A different perspective.
            </p>
          </div>
          <div className="scene-label">
            <span className="dot" /> LIVE 3D STUDY{" "}
            <span className="placeholder">TEMPORARY COUPE MODEL</span>
          </div>
          <div className="cinema-bottom">
            <div className="sequence">
              <span className="mono">{String(pct).padStart(3, "0")} / 100</span>
              <div className="progress-track">
                <i style={{ width: pct + "%" }} />
              </div>
              <strong>{phase}</strong>
            </div>
            <div className="scroll-cue">
              SCROLL TO TRACE THE LINE <span>↓</span>
            </div>
            <div className="scene-controls">
              <button
                onClick={() => setPaused((v) => !v)}
                aria-pressed={paused}
              >
                {paused ? "RESUME" : "PAUSE"} SMOKE
              </button>
              <label>
                QUALITY{" "}
                <select
                  aria-label="Scene quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="auto">AUTO</option>
                  <option value="low">LOW</option>
                  <option value="high">HIGH</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
      <section className="after-line">
        <div className="line-continuation" />
        <p className="eyebrow">THE LINE DOESN’T END AT THE CORNER.</p>
        <h2>
          IT BECOMES
          <br />
          <em>THE WAY FORWARD.</em>
        </h2>
        <div className="photo-story">
          <img
            src="/assets/photographs/drift.jpg"
            alt="Supplied photograph of a drift car trailing tyre smoke on asphalt"
            loading="lazy"
          />
          <div>
            <span className="mono">FROM THE SUPPLIED ARCHIVE</span>
            <h3>
              Rubber. Asphalt.
              <br />
              And the space between.
            </h3>
            <p>
              A study in movement, inspired by the real thing. Scroll back to
              replay the drift, or return to the lab to compare the concepts.
            </p>
            <button
              className="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: reduced ? "instant" : "smooth",
                })
              }
            >
              REPLAY THE LINE ↑
            </button>
            <a href="/">← Return to the lab</a>
          </div>
        </div>
        <footer>
          <span>01 — THE DRIFT LINE</span>
          <span>EXPERIMENTAL / FIRST PASS</span>
        </footer>
      </section>
    </div>
  );
}
