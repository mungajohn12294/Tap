// src/components/Toaster.js
import React from "react";

export default function Toaster({ message, type }) {
  if (!message) return null;
  const bgColor = type === "error" ? "#ff4d4d" : "#00ffaa";
  return (
    <div style={{ 
      position: "fixed", top: "20px", right: "20px", 
      background: bgColor, color: "#0f0f2b", padding: "12px 20px",
      borderRadius: "12px", fontWeight: "600", boxShadow: "0 0 20px "+bgColor,
      zIndex: 9999
    }}>
      {message}
    </div>
  );
}
