"use client";

import React from "react";
import CognitiveTimelineGraph from "../components/CognitiveTimelineGraph";
import BPGraph from "../components/BPGraph";

export default function HomePage() {
  return (
    <div className="home-dashboard" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
            Emotional Timeline
          </h2>
          <CognitiveTimelineGraph />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          Blood Pressure History
        </h2>
        <BPGraph />
      </div>
    </div>
  );
}
