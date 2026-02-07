import React, { useState, useMemo } from "react";
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

// Dropdown Component
function Dropdown({ label, options, value, onChange, placeholder = "Select" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.625rem 1rem",
          background: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: "600",
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          minWidth: "140px",
          justifyContent: "space-between",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#3b82f6";
          e.currentTarget.style.background = "#f8fafc";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.background = "white";
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{label}:</span>
        <span>{value || placeholder}</span>
        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              right: 0,
              background: "white",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
              zIndex: 1000,
              maxHeight: "240px",
              overflowY: "auto",
              minWidth: "160px",
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: value === option.value ? "#3b82f6" : "#475569",
                  background: value === option.value ? "#eff6ff" : "transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = "#f8fafc";
                  }
                }}
                onMouseOut={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
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

  // State for derivative types (multi-select)
  const [selectedDerivatives, setSelectedDerivatives] = useState({
    raw: true,
    d1: false,
    d2: false,
  });

  // State for custom date range overlay
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRange1Start, setDateRange1Start] = useState("");
  const [dateRange1End, setDateRange1End] = useState("");
  const [dateRange2Start, setDateRange2Start] = useState("");
  const [dateRange2End, setDateRange2End] = useState("");
  const [isDateRangeMode, setIsDateRangeMode] = useState(false);

  // Check if overlay mode is active (date ranges selected)
  const isOverlayMode = isDateRangeMode;

  // Toggle index visibility
  const toggleIndex = (index) => {
    setActiveIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Toggle derivative visibility
  const toggleDerivative = (derivative) => {
    setSelectedDerivatives((prev) => ({
      ...prev,
      [derivative]: !prev[derivative],
    }));
  };

  // Helper function to filter data by date range
  const filterByDateRange = (data, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter((d) => {
      const date = new Date(d.date);
      return date >= start && date <= end;
    });
  };

  // Apply date range overlay
  const applyDateRangeOverlay = () => {
    if (dateRange1Start && dateRange1End && dateRange2Start && dateRange2End) {
      setIsDateRangeMode(true);
      setShowDateRangeModal(false);
    }
  };

  // Clear date range overlay
  const clearDateRangeOverlay = () => {
    setIsDateRangeMode(false);
    setDateRange1Start("");
    setDateRange1End("");
    setDateRange2Start("");
    setDateRange2End("");
  };

  // Build datasets based on active indices and derivatives
  const buildDatasets = () => {
    const datasets = [];

    if (!isOverlayMode) {
      // NORMAL MODE - Single timeline (all data)
      const baseColors = {
        NDVI: { primary: "#22c55e", secondary: "#16a34a", tertiary: "#15803d" },
        NDWI: { primary: "#3b82f6", secondary: "#2563eb", tertiary: "#1d4ed8" },
        NSMI: { primary: "#f97316", secondary: "#ea580c", tertiary: "#c2410c" },
      };

      Object.keys(activeIndices).forEach((index) => {
        if (!activeIndices[index]) return;

        const colors = baseColors[index];

        // Add raw data if selected
        if (selectedDerivatives.raw) {
          datasets.push({
            label: index,
            data: timeseries.map((d) => d[index]),
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}1a`,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
          });
        }

        // Add 1st derivative if selected
        if (selectedDerivatives.d1) {
          datasets.push({
            label: `${index} (d1)`,
            data: timeseries.map((d) => d[`${index}_d1`]),
            borderColor: colors.secondary,
            backgroundColor: `${colors.secondary}1a`,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [5, 5],
          });
        }

        // Add 2nd derivative if selected
        if (selectedDerivatives.d2) {
          datasets.push({
            label: `${index} (d2)`,
            data: timeseries.map((d) => d[`${index}_d2`]),
            borderColor: colors.tertiary,
            backgroundColor: `${colors.tertiary}1a`,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [2, 2],
          });
        }
      });
    } else if (isDateRangeMode) {
      // DATE RANGE OVERLAY MODE
      const indexColors = {
        NDVI: { primary: "#22c55e", light: "rgba(34, 197, 94, 0.1)" },
        NDWI: { primary: "#3b82f6", light: "rgba(59, 130, 246, 0.1)" },
        NSMI: { primary: "#f97316", light: "rgba(249, 115, 22, 0.1)" },
      };

      const range1Data = filterByDateRange(timeseries, dateRange1Start, dateRange1End);
      const range2Data = filterByDateRange(timeseries, dateRange2Start, dateRange2End);

      // Create normalized indices (0, 1, 2, 3...) for x-axis alignment
      const maxLength = Math.max(range1Data.length, range2Data.length);
      
      Object.keys(activeIndices).forEach((index) => {
        if (!activeIndices[index]) return;

        const colorScheme = indexColors[index];

        // Add raw data if selected
        if (selectedDerivatives.raw) {
          // Range 1 - solid line
          const range1Values = Array(maxLength).fill(null);
          range1Data.forEach((d, i) => {
            range1Values[i] = d[index];
          });
          
          datasets.push({
            label: `${index} (${dateRange1Start} to ${dateRange1End})`,
            data: range1Values,
            borderColor: colorScheme.primary,
            backgroundColor: colorScheme.light,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
          });

          // Range 2 - dashed line
          const range2Values = Array(maxLength).fill(null);
          range2Data.forEach((d, i) => {
            range2Values[i] = d[index];
          });
          
          datasets.push({
            label: `${index} (${dateRange2Start} to ${dateRange2End})`,
            data: range2Values,
            borderColor: colorScheme.primary,
            backgroundColor: colorScheme.light,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [8, 4],
          });
        }

        // Add 1st derivative if selected
        if (selectedDerivatives.d1) {
          const range1D1Values = Array(maxLength).fill(null);
          range1Data.forEach((d, i) => {
            range1D1Values[i] = d[`${index}_d1`];
          });
          
          datasets.push({
            label: `${index} (d1) (${dateRange1Start} to ${dateRange1End})`,
            data: range1D1Values,
            borderColor: colorScheme.primary,
            backgroundColor: colorScheme.light,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [5, 5],
          });

          const range2D1Values = Array(maxLength).fill(null);
          range2Data.forEach((d, i) => {
            range2D1Values[i] = d[`${index}_d1`];
          });
          
          datasets.push({
            label: `${index} (d1) (${dateRange2Start} to ${dateRange2End})`,
            data: range2D1Values,
            borderColor: colorScheme.primary,
            backgroundColor: colorScheme.light,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [10, 5],
          });
        }

        // Add 2nd derivative if selected
        if (selectedDerivatives.d2) {
          const range1D2Values = Array(maxLength).fill(null);
          range1Data.forEach((d, i) => {
            range1D2Values[i] = d[`${index}_d2`];
          });
          
          datasets.push({
            label: `${index} (d2) (${dateRange1Start} to ${dateRange1End})`,
            data: range1D2Values,
            borderColor: colorScheme.primary,
            backgroundColor: colorScheme.light,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [2, 2],
          });

          const range2D2Values = Array(maxLength).fill(null);
          range2Data.forEach((d, i) => {
            range2D2Values[i] = d[`${index}_d2`];
          });
          
          datasets.push({
            label: `${index} (d2) (${dateRange2Start} to ${dateRange2End})`,
            data: range2D2Values,
            borderColor: colorScheme.primary,
            backgroundColor: colorScheme.light,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            spanGaps: true,
            borderDash: [6, 3],
          });
        }
      });
    }

    return datasets;
  };

  // Get labels based on mode
  const getChartLabels = () => {
    if (!isOverlayMode) {
      return timeseries.map((d) => d.date);
    } else {
      // For overlay mode, create normalized indices
      const range1Data = filterByDateRange(timeseries, dateRange1Start, dateRange1End);
      const range2Data = filterByDateRange(timeseries, dateRange2Start, dateRange2End);
      const maxLength = Math.max(range1Data.length, range2Data.length);
      
      // Use index numbers instead of dates for better comparison
      return Array.from({ length: maxLength }, (_, i) => `Point ${i + 1}`);
    }
  };

  // Chart configuration
  const chartData = {
    labels: getChartLabels(),
    datasets: buildDatasets(),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11,
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            weight: "500",
          },
          boxWidth: 8,
          boxHeight: 8,
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
        beginAtZero: false,
        grace: "10%",
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
          maxTicksLimit: 8,
        },
      },
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 10,
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          color: "#64748b",
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 15,
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
                📍 Location: {selectedPoint.lat.toFixed(4)},{" "}
                {selectedPoint.lng.toFixed(4)}
                {isDateRangeMode && (
                  <span style={{ marginLeft: "1rem", color: "#3b82f6" }}>
                    📅 Date Range Overlay Active
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowDateRangeModal(true)}
              style={{
                background: isDateRangeMode
                  ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  : "white",
                border: isDateRangeMode
                  ? "2px solid #2563eb"
                  : "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.625rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: isDateRangeMode ? "white" : "#475569",
                transition: "all 0.2s ease",
                fontWeight: "600",
                boxShadow: isDateRangeMode
                  ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                  : "none",
              }}
              onMouseOver={(e) => {
                if (!isDateRangeMode) {
                  e.target.style.background = "#f8fafc";
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.color = "#3b82f6";
                }
              }}
              onMouseOut={(e) => {
                if (!isDateRangeMode) {
                  e.target.style.background = "white";
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.color = "#475569";
                }
              }}
              title="Date Range Overlay"
            >
              📅 Date Range Overlay
            </button>
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
                  textColor="#16a34a"
                  unitColor="#15803d"
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
                  bgGradient="linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
                  borderColor="#fdba74"
                  textColor="#ea580c"
                  unitColor="#c2410c"
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
            {/* Top Controls Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left: Index Selection */}
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

              {/* Right: Derivative Selection */}
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
                  active={selectedDerivatives.raw}
                  onClick={() => toggleDerivative("raw")}
                >
                  📊 Raw
                </FilterButton>
                <FilterButton
                  active={selectedDerivatives.d1}
                  onClick={() => toggleDerivative("d1")}
                >
                  📈 d1
                </FilterButton>
                <FilterButton
                  active={selectedDerivatives.d2}
                  onClick={() => toggleDerivative("d2")}
                >
                  📉 d2
                </FilterButton>
              </div>
            </div>

            {/* Chart Container */}
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
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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

      {/* Date Range Overlay Modal */}
      {showDateRangeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1002,
          }}
          onClick={() => setShowDateRangeModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 1.5rem 0",
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              📅 Date Range Overlay
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Range 1 */}
              <div>
                <h4
                  style={{
                    margin: "0 0 0.75rem 0",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#3b82f6",
                  }}
                >
                  Range 1 (Solid Line)
                </h4>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.375rem",
                        fontWeight: "600",
                      }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange1Start}
                      onChange={(e) => setDateRange1Start(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.375rem",
                        fontWeight: "600",
                      }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange1End}
                      onChange={(e) => setDateRange1End(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Range 2 */}
              <div>
                <h4
                  style={{
                    margin: "0 0 0.75rem 0",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#ef4444",
                  }}
                >
                  Range 2 (Dashed Line)
                </h4>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.375rem",
                        fontWeight: "600",
                      }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange2Start}
                      onChange={(e) => setDateRange2Start(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#64748b",
                        marginBottom: "0.375rem",
                        fontWeight: "600",
                      }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange2End}
                      onChange={(e) => setDateRange2End(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Example */}
              <div
                style={{
                  padding: "0.875rem",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                <strong style={{ color: "#475569" }}>Example:</strong> Compare
                Jun 2015 - Jun 2016 with Jun 2024 - Jun 2025
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                {isDateRangeMode && (
                  <button
                    onClick={clearDateRangeOverlay}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "white",
                      border: "2px solid #e2e8f0",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#ef4444",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#fef2f2";
                      e.target.style.borderColor = "#ef4444";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "white";
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                  >
                    Clear Overlay
                  </button>
                )}
                <button
                  onClick={() => setShowDateRangeModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#64748b",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#cbd5e1";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "white";
                    e.target.style.borderColor = "#e2e8f0";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={applyDateRangeOverlay}
                  disabled={
                    !dateRange1Start ||
                    !dateRange1End ||
                    !dateRange2Start ||
                    !dateRange2End
                  }
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background:
                      dateRange1Start && dateRange1End && dateRange2Start && dateRange2End
                        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                        : "#e2e8f0",
                    border: "none",
                    borderRadius: "10px",
                    cursor:
                      dateRange1Start && dateRange1End && dateRange2Start && dateRange2End
                        ? "pointer"
                        : "not-allowed",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color:
                      dateRange1Start && dateRange1End && dateRange2Start && dateRange2End
                        ? "white"
                        : "#94a3b8",
                    transition: "all 0.2s ease",
                    boxShadow:
                      dateRange1Start && dateRange1End && dateRange2Start && dateRange2End
                        ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                        : "none",
                  }}
                >
                  Apply Overlay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}