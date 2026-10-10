import React from "react";

/**
 * Loader — a centered spinner shown during page loading or async operations.
 * Props:
 *   size     — size of the spinner in px (default 48)
 *   color    — spinner border color (default #0b4d78)
 *   message  — optional text displayed below the spinner
 */
export default function Loader({ size = 48, color = "#0b4d78", message = "" }) {
  const style = {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
      gap: "16px",
    },
    spinner: {
      width: size,
      height: size,
      border: `4px solid ${color}22`,
      borderTop: `4px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    message: {
      color: color,
      fontSize: "0.95rem",
      fontWeight: "500",
    },
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={style.wrapper} role="status" aria-live="polite">
        <div style={style.spinner} />
        {message && <span style={style.message}>{message}</span>}
      </div>
    </>
  );
}
