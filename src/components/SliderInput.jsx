import React from "react";

export default function SliderInput({ label, value, onChange }) {
  return (
    <div className="slider-container">
      <label>{label}: {value}%</label>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
    </div>
  );
}
