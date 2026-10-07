import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "./style.css";
import Header from "./scene/Header.jsx";
const DriftLine = lazy(() => import("./concepts/drift-line/DriftLine.jsx"));
const concepts = [
  [
    "01",
    "THE DRIFT LINE",
    "A sideways introduction.",
    "drift-line",
    "drift.jpg",
  ],
  ["02", "PIT GARAGE", "Inside the workshop.", "garage", "garage.jpg"],
  ["03", "TOUGE RUN", "Follow the mountain.", "touge", "japan.jpg"],
  ["04", "STICKER WALL", "Layers of a culture.", "sticker-wall", "merch.jpg"],
];
function Home() {
  return (
    <>
      <Header />
      <main className="home">
        <div className="intro">
          <p className="eyebrow">
            <span className="dot" /> BUILT2SLIDE / RESEARCH & DEVELOPMENT
          </p>
          <h1>
            3D EXPERIMENT
            <br />
            <span>LAB.</span>
          </h1>
          <div className="intro-bottom">
            <p>
              Built from drift culture.
              <br />
              Exploring what comes next.
            </p>
            <span className="mono">04 CONCEPTS / 01 IN MOTION</span>
          </div>
        </div>
        <div className="concept-grid">
          {concepts.map(([n, title, desc, path, img], i) => (
            <a
              className={"concept-card " + (i === 0 ? "available" : "")}
              key={path}
              href={"/" + path}
            >
              <div className="card-image">
                <img
                  src={"/assets/photographs/" + img}
                  alt={title + " visual reference"}
                  loading="lazy"
                />
                <span className="card-number">{n}</span>
                <span className="card-status">
                  {i === 0 ? "EXPLORE PROTOTYPE ↗" : "AWAITING REVIEW"}
                </span>
              </div>
              <div className="card-caption">
                <h2>{title}</h2>
                <span>↗</span>
              </div>
              <p>{desc}</p>
            </a>
          ))}
        </div>
        <footer>
          <span>BUILT2SLIDE — 3D EXPERIMENT LAB</span>
          <span>LOCAL PROTOTYPES. REAL CULTURE.</span>
        </footer>
      </main>
    </>
  );
}
function Pending({ concept }) {
  return (
    <>
      <Header />
      <main className="pending">
        <p className="eyebrow">EXPERIMENT {concept[0]} / NOT STARTED</p>
        <h1>{concept[1]}</h1>
        <p>This experiment comes after the visual review of The Drift Line.</p>
        <a className="button" href="/drift-line">
          EXPLORE THE DRIFT LINE ↗
        </a>
        <a href="/">← Back to the lab</a>
      </main>
    </>
  );
}
const path = window.location.pathname.replace(/\/$/, "") || "/";
const pending = concepts.slice(1).find((c) => "/" + c[3] === path);
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {path === "/" ? (
      <Home />
    ) : path === "/drift-line" ? (
      <Suspense
        fallback={<div className="loading">LOADING THE DRIFT LINE…</div>}
      >
        <DriftLine />
      </Suspense>
    ) : pending ? (
      <Pending concept={pending} />
    ) : (
      <main className="pending">
        <h1>OFF THE LINE.</h1>
        <a href="/">Return to the lab ↗</a>
      </main>
    )}
  </React.StrictMode>,
);
