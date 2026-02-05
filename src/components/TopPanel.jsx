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
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        padding: "1.75rem 2rem",
        borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        flexShrink: 0,
        animation: "slideInFromTop 0.5s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              margin: "0",
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              letterSpacing: "-0.025em",
            }}
          >
            <span
              style={{
                fontSize: "2rem",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            >
              🛰️
            </span>
            Satellite Indices Viewer
          </h2>

          <div
            style={{
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              borderRadius: "8px",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            }}
          >
            Dashboard
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          {/* Start Date Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.813rem",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em",
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
                padding: "0.75rem 1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s ease",
                background: "white",
                fontWeight: "500",
                color: "#1e293b",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* End Date Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.813rem",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em",
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
                padding: "0.75rem 1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s ease",
                background: "white",
                fontWeight: "500",
                color: "#1e293b",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Cloud Coverage Input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.813rem",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em",
              }}
            >
              Cloud Coverage
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
                padding: "0.75rem 1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s ease",
                background: "white",
                fontWeight: "500",
                color: "#1e293b",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Index Type Dropdown */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.813rem",
                fontWeight: "600",
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em",
              }}
            >
              Index Type
            </label>
            <select
              value={indexType}
              onChange={(e) => setIndexType(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s ease",
                background: "white",
                cursor: "pointer",
                fontWeight: "500",
                color: "#1e293b",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
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
              padding: "0.75rem 1.75rem",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              letterSpacing: "0.01em",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
            }}
          >
            🔄 Load Composite
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
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                background: "white",
                color: "#3b82f6",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15)",
                letterSpacing: "0.01em",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#3b82f6";
                e.target.style.color = "white";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "white";
                e.target.style.color = "#3b82f6";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.15)";
              }}
            >
              <span>📥</span> Download {indexType} GeoTIFF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}