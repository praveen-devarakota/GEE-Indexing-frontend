import React, { useState } from "react";
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
        padding: "1.25rem",
        background: bgGradient,
        borderRadius: "14px",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 4px 12px ${textColor}26`,
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          color: textColor,
          fontWeight: "700",
          marginBottom: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "2.25rem",
          fontWeight: "700",
          color: textColor,
          marginBottom: "0.375rem",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: unitColor,
          fontWeight: "600",
        }}
      >
        {unit}
      </div>
    </div>
  );
}

// Filter Button Component
function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.625rem 1.25rem",
        background: active
          ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          : "white",
        color: active ? "white" : "#64748b",
        border: active ? "2px solid #2563eb" : "2px solid #e2e8f0",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
        boxShadow: active ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.target.style.background = "#f8fafc";
          e.target.style.borderColor = "#cbd5e1";
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.target.style.background = "white";
          e.target.style.borderColor = "#e2e8f0";
        }
      }}
    >
      {children}
    </button>
  );
}

export function ChartModal({
  showModal,
  isFullscreen,
  selectedPoint,
  timeseries,
  stats,
  toggleFullscreen,
  closeModal,
}) {
  // State for which indices to show
  const [activeIndices, setActiveIndices] = useState({
    NDVI: true,
    NDWI: true,
    NSMI: true,
  });

  // State for which derivative types to show
  const [activeDerivatives, setActiveDerivatives] = useState({
    raw: true,
    d1: false,
    d2: false,
  });

  // Toggle index visibility
  const toggleIndex = (index) => {
    setActiveIndices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Toggle derivative visibility
  const toggleDerivative = (type) => {
    setActiveDerivatives(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Build datasets based on active indices and derivatives
  const buildDatasets = () => {
    const datasets = [];

    // NDVI datasets
    if (activeIndices.NDVI) {
      if (activeDerivatives.raw) {
        datasets.push({
          label: "NDVI",
          data: timeseries.map((d) => d.NDVI),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
        });
      }
      if (activeDerivatives.d1) {
        datasets.push({
          label: "NDVI (d1)",
          data: timeseries.map((d) => d.NDVI_d1),
          borderColor: "#059669",
          backgroundColor: "rgba(5, 150, 105, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          borderDash: [5, 5],
        });
      }
      if (activeDerivatives.d2) {
        datasets.push({
          label: "NDVI (d2)",
          data: timeseries.map((d) => d.NDVI_d2),
          borderColor: "#047857",
          backgroundColor: "rgba(4, 120, 87, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          borderDash: [2, 2],
        });
      }
    }

    // NDWI datasets
    if (activeIndices.NDWI) {
      if (activeDerivatives.raw) {
        datasets.push({
          label: "NDWI",
          data: timeseries.map((d) => d.NDWI),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
        });
      }
      if (activeDerivatives.d1) {
        datasets.push({
          label: "NDWI (d1)",
          data: timeseries.map((d) => d.NDWI_d1),
          borderColor: "#1d4ed8",
          backgroundColor: "rgba(29, 78, 216, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          borderDash: [5, 5],
        });
      }
      if (activeDerivatives.d2) {
        datasets.push({
          label: "NDWI (d2)",
          data: timeseries.map((d) => d.NDWI_d2),
          borderColor: "#1e40af",
          backgroundColor: "rgba(30, 64, 175, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          borderDash: [2, 2],
        });
      }
    }

    // NSMI datasets
    if (activeIndices.NSMI) {
      if (activeDerivatives.raw) {
        datasets.push({
          label: "NSMI",
          data: timeseries.map((d) => d.NSMI),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
        });
      }
      if (activeDerivatives.d1) {
        datasets.push({
          label: "NSMI (d1)",
          data: timeseries.map((d) => d.NSMI_d1),
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          borderDash: [5, 5],
        });
      }
      if (activeDerivatives.d2) {
        datasets.push({
          label: "NSMI (d2)",
          data: timeseries.map((d) => d.NSMI_d2),
          borderColor: "#b45309",
          backgroundColor: "rgba(180, 83, 9, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          borderDash: [2, 2],
        });
      }
    }

    return datasets;
  };

  // Chart configuration
  const chartData = {
    labels: timeseries.map((d) => d.date),
    datasets: buildDatasets(),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1e293b",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        font: {
          family:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          color: "#64748b",
        },
      },
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          color: "#64748b",
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  if (!showModal || !isFullscreen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
        padding: "1.5rem",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      {/* Modal Content */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.4)",
          width: "100%",
          height: "100%",
          maxWidth: "1400px",
          maxHeight: "calc(100vh - 3rem)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 2rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 0.35rem 0",
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#0f172a",
                letterSpacing: "-0.025em",
              }}
            >
              📊 Analytics Dashboard
            </h3>
            {selectedPoint && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  fontWeight: "500",
                }}
              >
                📍 Location: {selectedPoint.lat.toFixed(4)},
                {selectedPoint.lng.toFixed(4)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={toggleFullscreen}
              style={{
                background: "white",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.625rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "#475569",
                transition: "all 0.2s ease",
                fontWeight: "600",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#3b82f6";
                e.target.style.color = "#3b82f6";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.color = "#475569";
              }}
              title="Exit Fullscreen"
            >
              ← Exit Fullscreen
            </button>
            <button
              onClick={closeModal}
              style={{
                background: "white",
                border: "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.625rem 0.875rem",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                lineHeight: 1,
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#fef2f2";
                e.target.style.borderColor = "#ef4444";
                e.target.style.color = "#ef4444";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.color = "#64748b";
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
            overflow: "hidden",
            padding: "1.5rem 2rem",
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "2rem",
          }}
        >
          {/* Left Side - Statistics */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              overflow: "auto",
            }}
          >
            <h4
              style={{
                margin: "0",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#0f172a",
                letterSpacing: "-0.025em",
              }}
            >
              Statistics Summary
            </h4>

            {stats ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                <StatCard
                  label="NDVI"
                  value={stats.avg_ndvi}
                  unit="Vegetation Index"
                  bgGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                  borderColor="#a7f3d0"
                  textColor="#059669"
                  unitColor="#047857"
                />
                <StatCard
                  label="NDWI"
                  value={stats.avg_ndwi}
                  unit="Water Index"
                  bgGradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  borderColor="#93c5fd"
                  textColor="#2563eb"
                  unitColor="#1d4ed8"
                />
                <StatCard
                  label="NSMI"
                  value={stats.avg_nsmi}
                  unit="Soil Moisture Index"
                  bgGradient="linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                  borderColor="#fcd34d"
                  textColor="#d97706"
                  unitColor="#b45309"
                />
              </div>
            ) : (
              <div
                style={{
                  padding: "2rem 1.5rem",
                  color: "#94a3b8",
                  fontSize: "0.938rem",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Loading statistics...
              </div>
            )}
          </div>

          {/* Right Side - Chart */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              minHeight: 0,
            }}
          >
            {/* Top Level - Index Selection */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4
                style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  letterSpacing: "-0.025em",
                }}
              >
                Time Series Analysis
              </h4>

              {/* Index Filter Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "0.625rem",
                  background: "#f8fafc",
                  padding: "0.5rem",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <FilterButton
                  active={activeIndices.NDVI}
                  onClick={() => toggleIndex("NDVI")}
                >
                  🌿 NDVI
                </FilterButton>
                <FilterButton
                  active={activeIndices.NDWI}
                  onClick={() => toggleIndex("NDWI")}
                >
                  💧 NDWI
                </FilterButton>
                <FilterButton
                  active={activeIndices.NSMI}
                  onClick={() => toggleIndex("NSMI")}
                >
                  🏜️ NSMI
                </FilterButton>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "white",
                borderRadius: "14px",
                padding: "1.5rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Internal Derivative Filter Toggles */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "center",
                  padding: "0.75rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "700", 
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "0.5rem",
                  borderRight: "2px solid #e2e8f0"
                }}>
                  DERIVATIVES:
                </div>
                <FilterButton
                  active={activeDerivatives.raw}
                  onClick={() => toggleDerivative("raw")}
                >
                  📊 Raw
                </FilterButton>
                <FilterButton
                  active={activeDerivatives.d1}
                  onClick={() => toggleDerivative("d1")}
                >
                  📈 1st (d1)
                </FilterButton>
                <FilterButton
                  active={activeDerivatives.d2}
                  onClick={() => toggleDerivative("d2")}
                >
                  📉 2nd (d2)
                </FilterButton>
              </div>

              {/* Chart */}
              <div style={{ 
                flex: 1, 
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {timeseries.length > 0 ? (
                  <div style={{ width: "100%", height: "100%" }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "1rem",
                      fontWeight: "500",
                    }}
                  >
                    Loading chart data...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}