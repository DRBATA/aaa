"use client";

import React from "react";
import CognitiveTimelineGraph from "../components/ui/CognitiveTimelineGraph";
import BPGraph from "../components/ui/BPGraph";

export default function HomePage() {
  return (
    <div className="home-dashboard" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <CognitiveTimelineGraph />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <BPGraph />
      </div>
    </div>
  );
}
