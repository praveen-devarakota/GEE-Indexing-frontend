import React from "react";

export function TopPanel({
  form,
  setForm,
  indexType,
  setIndexType,
  fetchComposite,
  downloadUrl,
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "1.5rem",
        borderBottom: "2px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      <h2
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1.5rem",
          fontWeight: "normal",
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
        🌍 Satellite Indices Viewer
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 100px 140px auto 1fr",
          gap: "0.75rem",
          alignItems: "end",
        }}
      >
        {/* Start Date Input */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: "4px",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s",
              background: "white",
              fontFamily: "'Times New Roman', Times, serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* End Date Input */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            End Date
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: "4px",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s",
              background: "white",
              fontFamily: "'Times New Roman', Times, serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* Cloud Percentage Input */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Cloud %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={form.max_cloud}
            onChange={(e) =>
              setForm({ ...form, max_cloud: e.target.value })
            }
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: "4px",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s",
              background: "white",
              fontFamily: "'Times New Roman', Times, serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* Index Type Dropdown */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "500",
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Index Type
          </label>
          <select
            value={indexType}
            onChange={(e) => setIndexType(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: "4px",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s",
              background: "white",
              cursor: "pointer",
              fontFamily: "'Times New Roman', Times, serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          >
            <option value="NDVI">NDVI</option>
            <option value="NDWI">NDWI</option>
            <option value="NSMI">NSMI</option>
            <option value="TRUE_COLOR">True Color</option>
          </select>
        </div>

        {/* Load Composite Button */}
        <button
          onClick={fetchComposite}
          style={{
            padding: "0.625rem 1.5rem",
            background: "#3b82f6",
            color: "white",
            border: "1.5px solid #2563eb",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            fontFamily: "'Times New Roman', Times, serif",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#2563eb";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow =
              "0 4px 6px rgba(37, 99, 235, 0.2)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#3b82f6";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Load Composite
        </button>

        {/* Download Button */}
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.625rem 1.25rem",
              background: "white",
              color: "#3b82f6",
              border: "1.5px solid #3b82f6",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: "500",
              textDecoration: "none",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              fontFamily: "'Times New Roman', Times, serif",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#eff6ff";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow =
                "0 4px 6px rgba(59, 130, 246, 0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "white";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          >
            📥 Download {indexType} GeoTIFF
          </a>
        )}
      </div>
    </div>
  );
}