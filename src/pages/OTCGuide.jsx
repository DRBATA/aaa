// pages/OTCGuide.jsx
import React, { useState } from "react";
import { Search } from "lucide-react";

export default function OTCGuide() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>OTC Guide</h1>
        <p className="subtitle">
          Find over‑the‑counter treatment options and advice tailored to your
          symptoms.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="search-container" style={{ marginBottom: "1rem" }}>
            <Search className="search-icon" size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search OTC treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search OTC treatments"
            />
          </div>
          <p>
            [Placeholder for OTC treatment advice and content based on the
            search query: <em>{searchQuery}</em>]
          </p>
        </div>
      </div>
    </div>
  );
}
