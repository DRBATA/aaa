import React from "react";

export function Button({ children, variant = "default", className = "", ...props }) {
  const base = "px-4 py-2 rounded focus:outline-none transition-colors";
  let styles = "";

  if (variant === "outline") {
    styles = "border border-gray-300 text-gray-700 hover:bg-gray-100";
  } else if (variant === "ghost") {
    styles = "bg-transparent text-gray-700 hover:bg-gray-100";
  } else {
    styles = "bg-blue-500 text-white hover:bg-blue-600";
  }

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
