import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Proper marker icon fix for Vite + Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Click handler enabling point picking + smooth animation
function ClickHandler({ onClick }) {
  const map = useMapEvents({
    click(e) {
      map.flyTo(e.latlng, map.getZoom());
      onClick(e.latlng);
    },
  });
  return null;
}

// Component to capture map instance
function MapEvents({ setMapInstance }) {
  const map = useMapEvents({});
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
}

// Statistics Card Component
function StatCard({
  label,
  value,
  unit,
  bgGradient,
  borderColor,
  textColor,
  unitColor,
}) {
  return (
    <div
      style={{
        padding: "0.75rem",
        background: bgGradient,
        borderRadius: "10px",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 2px 4px ${textColor}22`,
      }}
    >
      <div
        style={{
          fontSize: "0.625rem",
          color: textColor,
          fontWeight: "700",
          marginBottom: "0.35rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          color: textColor,
          marginBottom: "0.15rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.563rem",
          color: unitColor,
          fontWeight: "600",
        }}
      >
        {unit}
      </div>
    </div>
  );
}

export function MapSection({
  tileUrl,
  selectedPoint,
  fetchTimeseries,
  setMapInstance,
  showModal,
  isFullscreen,
  popupPosition,
  popupRef,
  isDragging,
  handleMouseDown,
  customPopupPos,
  getPopupStyle,
  closeModal,
  toggleFullscreen,
  timeseries,
  stats,
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "1.5rem",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          position: "relative",
          animation: "fadeIn 0.5s ease-out 0.2s both",
        }}
      >
        <MapContainer
          center={[17.0, 81.8]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; Esri — Imagery"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {tileUrl && <TileLayer url={tileUrl} opacity={0.7} />}
          {selectedPoint && (
            <Marker position={[selectedPoint.lat, selectedPoint.lng]} />
          )}
          <MapEvents setMapInstance={setMapInstance} />
          <ClickHandler onClick={(latlng) => fetchTimeseries(latlng)} />
        </MapContainer>

        {/* Modern Draggable Floating Popup */}
        {showModal && !isFullscreen && popupPosition && (
          <>
            {/* Connection line from pointer to popup - only show if not custom positioned */}
            {!customPopupPos && (
              <svg
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 999,
                }}
              >
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "#3b82f6", stopOpacity: 0.8 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "#3b82f6", stopOpacity: 0.2 }}
                    />
                  </linearGradient>
                </defs>
                <line
                  x1={popupPosition.x}
                  y1={popupPosition.y}
                  x2={
                    popupPosition.x > window.innerWidth / 2
                      ? popupPosition.x - 80
                      : popupPosition.x + 80
                  }
                  y2={Math.max(
                    60,
                    Math.min(popupPosition.y, window.innerHeight - 200)
                  )}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  style={{
                    animation: "dashAnimation 1s linear infinite",
                  }}
                />
              </svg>
            )}

            <div
              ref={popupRef}
              onMouseDown={handleMouseDown}
              style={{
                position: "absolute",
                ...getPopupStyle(),
                width: "480px",
                maxHeight: "380px",
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                borderRadius: "16px",
                boxShadow: isDragging
                  ? "0 25px 80px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(59, 130, 246, 0.2)"
                  : "0 20px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                animation: customPopupPos
                  ? "none"
                  : "geniePopup 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                pointerEvents: "auto",
                transformOrigin:
                  popupPosition.x > window.innerWidth / 2
                    ? "right center"
                    : "left center",
                transition: isDragging ? "none" : "box-shadow 0.2s ease",
              }}
            >
              {/* Header with drag handle */}
              <div
                className="drag-handle"
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)",
                  flexShrink: 0,
                }}
              >
                <div style={{ pointerEvents: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.15rem",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      ⋮⋮
                    </span>
                    <h4
                      style={{
                        margin: "0",
                        fontSize: "1rem",
                        fontWeight: "700",
                        color: "#0f172a",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      📊 Analytics Dashboard
                    </h4>
                  </div>
                  {selectedPoint && (
                    <div
                      style={{
                        fontSize: "0.688rem",
                        color: "#64748b",
                        fontWeight: "500",
                        marginTop: "0.15rem",
                        marginLeft: "1.5rem",
                      }}
                    >
                      📍 {selectedPoint.lat.toFixed(4)},{" "}
                      {selectedPoint.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                <div
                  style={{ display: "flex", gap: "0.4rem", pointerEvents: "auto" }}
                >
                  <button
                    onClick={toggleFullscreen}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "0.4rem 0.6rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#64748b",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#f8fafc";
                      e.target.style.color = "#3b82f6";
                      e.target.style.borderColor = "#3b82f6";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = "#64748b";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                    title="Fullscreen"
                  >
                    ⛶
                  </button>
                  <button
                    onClick={closeModal}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      padding: "0.4rem 0.6rem",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#64748b",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#fef2f2";
                      e.target.style.color = "#ef4444";
                      e.target.style.borderColor = "#ef4444";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = "#64748b";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Content - Compact Single Column Layout */}
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Statistics Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <h5
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "0.813rem",
                      fontWeight: "700",
                      color: "#0f172a",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Statistics
                  </h5>

                  {stats ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.5rem",
                      }}
                    >
                      <StatCard
                        label="NDVI"
                        value={stats.avg_ndvi}
                        unit="Vegetation"
                        bgGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                        borderColor="#a7f3d0"
                        textColor="#059669"
                        unitColor="#047857"
                      />
                      <StatCard
                        label="NDWI"
                        value={stats.avg_ndwi}
                        unit="Water"
                        bgGradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                        borderColor="#93c5fd"
                        textColor="#2563eb"
                        unitColor="#1d4ed8"
                      />
                      <StatCard
                        label="NSMI"
                        value={stats.avg_nsmi}
                        unit="Soil"
                        bgGradient="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                        borderColor="#fcd34d"
                        textColor="#d97706"
                        unitColor="#b45309"
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                        padding: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      Loading statistics...
                    </div>
                  )}
                </div>

                {/* Chart Section - Using compact version */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    flex: 1,
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 0.25rem 0",
                      fontSize: "0.813rem",
                      fontWeight: "700",
                      color: "#0f172a",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Time Series
                  </h5>

                  {timeseries.length > 0 ? (
                    <div
                      style={{
                        flex: 1,
                        minHeight: "200px",
                        background: "white",
                        borderRadius: "10px",
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      {/* Chart will be rendered by parent component */}
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.75rem",
                            fontWeight: "500",
                          }}
                        >
                          Chart placeholder - See fullscreen for detailed view
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        minHeight: "200px",
                        background: "white",
                        borderRadius: "10px",
                        padding: "0.75rem",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      Loading chart data...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}