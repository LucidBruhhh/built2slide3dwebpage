import React, { Component } from "react";
export default class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback" role="status">
        <p>
          3D couldn’t load.
          <br />
          You can still explore BRUH in the photographs.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function ModelLoading() {
  return (
    <div className="model-loading" role="status">
      <span>LOADING BRUH</span>
      <small>Preparing the 3D model…</small>
    </div>
  );
}
