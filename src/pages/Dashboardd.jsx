import React from "react";

export default function Dashboard() {
  const page = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f1a2b, #121a2b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Poppins, system-ui, sans-serif",
  };

  const textStyle = {
    color: "#ffffff",
    fontSize: "40px",
    fontWeight: "900",
    textAlign: "center",
    textShadow: "0 0 10px rgba(255,255,255,0.7)",
    letterSpacing: "1px",
  };

  return (
    <div style={page}>
      <h1 style={textStyle}>الف مبروك انتي بالصفحة الرئيسية </h1>
    </div>
  );
}
