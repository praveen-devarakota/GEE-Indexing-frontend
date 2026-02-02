import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

export function ChartModal({
  showModal,
  isFullscreen,
  selectedPoint,
  timeseries,
  stats,
  toggleFullscreen,
  closeModal,
}) {
  // Chart configuration
  const chartData = {
    labels: timeseries.map((d) => d.date),
    datasets: [
      {
        label: "NDVI",
        data: timeseries.map((d) => d.NDVI),
        borderColor: "#10b981",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: "NDWI",
        data: timeseries.map((d) => d.NDWI),
        borderColor: "#3b82f6",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: "NSMI",
        data: timeseries.map((d) => d.NSMI),
        borderColor: "#f59e0b",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  // Statistics Card Component
  function StatCard({ label, value, unit, bgGradient, borderColor, textColor, unitColor }) {
    return (
      <div
        style={{
          padding: "0.6rem 0.8rem",
          background: bgGradient,
          borderRadius: "4px",
          border: `1.5px solid ${borderColor}`,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: textColor,
            fontWeight: "600",
            marginBottom: "0.15rem",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: "normal",
            color: textColor,
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.65rem",
            color: unitColor,
            marginTop: "0.15rem",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {unit}
        </div>
      </div>
    );
  }

  // Floating Popup Modal (Non-fullscreen)
  if (showModal && !isFullscreen) {
    return (
      <div
        style={{
          position: "absolute",
          left: "calc(50% + 140px)",
          top: "50%",
          transform: "translate(0, -50%)",
          width: "620px",
          maxHeight: "470px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "popupSlideIn 0.3s ease-out",
          fontFamily: "'Times New Roman', Times, serif",
          right: "20px",
        }}
      >
        <style>{`
          @keyframes popupSlideIn {
            from {
              opacity: 0;
              transform: translate(0, -50%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translate(0, -50%) scale(1);
            }
          }
          
          @media (max-width: 1400px) {
            .popup-container {
              position: absolute !important;
              left: auto !important;
              right: 20px !important;
              width: 520px !important;
            }
          }
          
          @media (max-width: 1200px) {
            .popup-container {
              width: 480px !important;
            }
          }
          
          @media (max-width: 1000px) {
            .popup-container {
              width: 420px !important;
              left: auto !important;
              right: 15px !important;
            }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "1rem",
            borderBottom: "1.5px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <div>
            <h4
              style={{
                margin: "0 0 0.25rem 0",
                fontSize: "1rem",
                fontWeight: "normal",
                color: "#1e293b",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              📈 Analytics
            </h4>
            {selectedPoint && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#64748b",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                📍 {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={toggleFullscreen}
              style={{
                background: "none",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                padding: "0.4rem 0.6rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "#475569",
                transition: "all 0.2s",
                fontFamily: "'Times New Roman', Times, serif",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#f1f5f9";
                e.target.style.borderColor = "#94a3b8";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "none";
                e.target.style.borderColor = "#cbd5e1";
              }}
              title="Fullscreen"
            >
              ⛶
            </button>
            <button
              onClick={closeModal}
              style={{
                background: "none",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                padding: "0.4rem 0.6rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "#475569",
                transition: "all 0.2s",
                fontFamily: "'Times New Roman', Times, serif",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#f1f5f9";
                e.target.style.borderColor = "#94a3b8";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "none";
                e.target.style.borderColor = "#cbd5e1";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {/* Left Side - Statistics */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h5
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#1e293b",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              📊 Stats
            </h5>

            {stats ? (
              <>
                <StatCard
                  label="NDVI"
                  value={stats.avg_ndvi}
                  unit="Vegetation"
                  bgGradient="linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)"
                  borderColor="#a7f3d0"
                  textColor="#047857"
                  unitColor="#059669"
                />
                <StatCard
                  label="NDWI"
                  value={stats.avg_ndwi}
                  unit="Water"
                  bgGradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  borderColor="#93c5fd"
                  textColor="#1d4ed8"
                  unitColor="#2563eb"
                />
                <StatCard
                  label="NSMI"
                  value={stats.avg_nsmi}
                  unit="Soil"
                  bgGradient="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                  borderColor="#fcd34d"
                  textColor="#b45309"
                  unitColor="#d97706"
                />
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  padding: "1rem",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                Loading...
              </div>
            )}
          </div>

          {/* Right Side - Chart */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h5
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#1e293b",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              📉 Trend
            </h5>

            {timeseries.length > 0 ? (
              <div
                style={{
                  flex: 1,
                  minHeight: "280px",
                  background: "#f8fafc",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: "280px",
                  background: "#f8fafc",
                  borderRadius: "4px",
                  padding: "0.75rem",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "0.85rem",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                Loading chart...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full Screen Modal
  if (showModal && isFullscreen) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
          padding: "10px",
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
        {/* Modal Content */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            width: "100%",
            height: "100%",
            maxHeight: "calc(100vh - 20px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "2rem",
              borderBottom: "2px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              background: "#f8fafc",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.75rem",
                  fontWeight: "normal",
                  color: "#1e293b",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                📈 Time-Series Analytics
              </h3>
              {selectedPoint && (
                <div
                  style={{
                    fontSize: "0.95rem",
                    color: "#64748b",
                    fontWeight: "normal",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  📍 Location: {selectedPoint.lat.toFixed(4)},
                  {selectedPoint.lng.toFixed(4)}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={toggleFullscreen}
                style={{
                  background: "white",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "0.6rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  color: "#475569",
                  transition: "all 0.2s",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#f1f5f9";
                  e.target.style.borderColor = "#94a3b8";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "white";
                  e.target.style.borderColor = "#cbd5e1";
                }}
                title="Exit Fullscreen"
              >
                Exit ⛶
              </button>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "2rem",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0.5rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
                onMouseOver={(e) => {
                  e.target.style.color = "#1e293b";
                  e.target.style.background = "#e2e8f0";
                  e.target.style.borderRadius = "4px";
                }}
                onMouseOut={(e) => {
                  e.target.style.color = "#94a3b8";
                  e.target.style.background = "none";
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "2rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            {/* Left Side - Statistics */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h4
                style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "normal",
                  color: "#1e293b",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                📊 Statistics Summary
              </h4>

              {stats ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "0.75rem",
                  }}
                >
                  <StatCard
                    label="NDVI"
                    value={stats.avg_ndvi}
                    unit="Vegetation"
                    bgGradient="linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)"
                    borderColor="#a7f3d0"
                    textColor="#047857"
                    unitColor="#059669"
                  />
                  <StatCard
                    label="NDWI"
                    value={stats.avg_ndwi}
                    unit="Water"
                    bgGradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                    borderColor="#93c5fd"
                    textColor="#1d4ed8"
                    unitColor="#2563eb"
                  />
                  <StatCard
                    label="NSMI"
                    value={stats.avg_nsmi}
                    unit="Soil"
                    bgGradient="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                    borderColor="#fcd34d"
                    textColor="#b45309"
                    unitColor="#d97706"
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: "1.5rem 1rem",
                    color: "#94a3b8",
                    fontSize: "0.95rem",
                    textAlign: "center",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  Loading statistics...
                </div>
              )}
            </div>

            {/* Right Side - Chart */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h4
                style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "normal",
                  color: "#1e293b",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                📉 Time Series Trend
              </h4>

              <div
                style={{
                  flex: 1,
                  minHeight: "400px",
                  background: "#f8fafc",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                {timeseries.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      fontSize: "1rem",
                      fontFamily: "'Times New Roman', Times, serif",
                    }}
                  >
                    Loading chart...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}