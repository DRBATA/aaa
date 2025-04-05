import React from "react";

export function Badge({ children, variant = "default", className = "", ...props }) {
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  let styles = "";

  if (variant === "outline") {
    styles = "border border-gray-300 text-gray-700";
  } else {
    styles = "bg-gray-200 text-gray-800";
  }

  return (
    <span className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </span>
  );
}
