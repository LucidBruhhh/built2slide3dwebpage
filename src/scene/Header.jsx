import React from "react";
export default function Header() {
  return (
    <header>
      <a className="brand" href="/" aria-label="Built2Slide lab home">
        <img src="/assets/brand/logo.png" alt="Built2Slide" />
      </a>
      <span className="header-note">INDEPENDENT EXPERIMENTS / VOL. 01</span>
      <a className="lab-link" href="/">
        THE LAB <span>↗</span>
      </a>
    </header>
  );
}
