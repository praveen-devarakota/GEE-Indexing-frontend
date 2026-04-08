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
import { interpolateNulls, computeDerivatives } from "../utils/timeseriesUtils";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

function StatCard({ label, value, unit, bgGradient, borderColor, textColor, unitColor }) {
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
      <div style={{ fontSize: "0.75rem", color: textColor, fontWeight: "700", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: "2.25rem", fontWeight: "700", color: textColor, marginBottom: "0.375rem", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: unitColor, fontWeight: "600" }}>
        {unit}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.625rem 1.25rem",
        background: active ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "white",
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
          e.currentTarget.style.background = "#f8fafc";
          e.currentTarget.style.borderColor = "#cbd5e1";
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.borderColor = "#e2e8f0";
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
  fetchTimeseries,
}) {
  const [activeIndices, setActiveIndices] = useState({ NDVI: true, NDWI: true, NSMI: true });
  const [selectedDerivatives, setSelectedDerivatives] = useState({ raw: true, d1: false, d2: false });
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRange1Start, setDateRange1Start] = useState("");
  const [dateRange1End, setDateRange1End] = useState("");
  const [dateRange2Start, setDateRange2Start] = useState("");
  const [dateRange2End, setDateRange2End] = useState("");

  const isOverlayMode =
    timeseries && !Array.isArray(timeseries) && Array.isArray(timeseries.ranges);

  const toggleIndex = (index) =>
    setActiveIndices((prev) => ({ ...prev, [index]: !prev[index] }));

  const toggleDerivative = (derivative) =>
    setSelectedDerivatives((prev) => ({ ...prev, [derivative]: !prev[derivative] }));

  // ─── Pre-process: interpolate nulls + compute derivatives ────────────────
  const processedTimeseries = React.useMemo(() => {
    if (!Array.isArray(timeseries) || timeseries.length === 0) return timeseries;
    const filled = interpolateNulls(timeseries);
    return computeDerivatives(filled);
  }, [timeseries]);

  // ─── Overlay actions ─────────────────────────────────────────────────────
  const applyDateRangeOverlay = () => {
    if (!dateRange1Start || !dateRange1End || !dateRange2Start || !dateRange2End || !selectedPoint) return;
    fetchTimeseries(selectedPoint, {
      ranges: [
        { start_date: dateRange1Start, end_date: dateRange1End },
        { start_date: dateRange2Start, end_date: dateRange2End },
      ],
    });
    setShowDateRangeModal(false);
  };

  const clearDateRangeOverlay = () => {
    setDateRange1Start("");
    setDateRange1End("");
    setDateRange2Start("");
    setDateRange2End("");
    if (selectedPoint) fetchTimeseries(selectedPoint, null);
    setShowDateRangeModal(false);
  };

  // ─── Dataset builder ──────────────────────────────────────────────────────
  const buildDatasets = () => {
    const datasets = [];
    const baseColors = {
      NDVI: { primary: "#22c55e", secondary: "#16a34a", tertiary: "#15803d" },
      NDWI: { primary: "#3b82f6", secondary: "#2563eb", tertiary: "#1d4ed8" },
      NSMI: { primary: "#f97316", secondary: "#ea580c", tertiary: "#c2410c" },
    };

    // ── NORMAL MODE ──────────────────────────────────────────────────────────
    // Data is passed as plain scalar arrays (no {x,y} objects).
    // Labels array drives the x-axis — every scene is rendered by index.
    if (!isOverlayMode && Array.isArray(processedTimeseries)) {
      Object.keys(activeIndices).forEach((index) => {
        if (!activeIndices[index]) return;
        const colors = baseColors[index];

        if (selectedDerivatives.d2) {
          datasets.push({
            label: `${index} (d2)`,
            data: processedTimeseries.map((d) => d[`${index}_d2`] ?? null),
            borderColor: colors.tertiary,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            spanGaps: true,
            pointRadius: 0,
            pointHoverRadius: 3,
            order: 3,
            segment: { borderDash: () => [2, 3] },
          });
        }

        if (selectedDerivatives.d1) {
          datasets.push({
            label: `${index} (d1)`,
            data: processedTimeseries.map((d) => d[`${index}_d1`] ?? null),
            borderColor: colors.secondary,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            spanGaps: true,
            pointRadius: 0,
            pointHoverRadius: 3,
            order: 2,
            segment: { borderDash: () => [6, 4] },
          });
        }

        if (selectedDerivatives.raw) {
          datasets.push({
            label: index,
            // Plain scalars — Chart.js maps each value to the label at the same index.
            data: processedTimeseries.map((d) => d[index] ?? null),
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}18`,
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            spanGaps: true,
            // Read interpolation flag directly from processedTimeseries by dataIndex.
            pointRadius: (ctx) =>
              processedTimeseries[ctx.dataIndex]?.[`${index}_interpolated`] ? 0 : 2,
            pointStyle: (ctx) =>
              processedTimeseries[ctx.dataIndex]?.[`${index}_interpolated`] ? "dash" : "circle",
            pointHoverRadius: 4,
            order: 1,
          });
        }
      });
    }

    // ── OVERLAY MODE ─────────────────────────────────────────────────────────
    else if (isOverlayMode && timeseries.ranges.length >= 2) {
      const range1 = timeseries.ranges[0];
      const range2 = timeseries.ranges[1];
      const maxLength = Math.max(range1.data.length, range2.data.length);

      Object.keys(activeIndices).forEach((index) => {
        if (!activeIndices[index]) return;
        const color = baseColors[index].primary;

        if (selectedDerivatives.raw) {
          // Plain scalar arrays aligned to maxLength
          const r1 = Array.from({ length: maxLength }, (_, i) =>
            range1.data[i]?.[index] ?? null
          );
          datasets.push({
            label: `${index} (${range1.range})`,
            data: r1,
            borderColor: color,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            spanGaps: true,
            pointRadius: 2,
            pointHoverRadius: 4,
          });

          const r2 = Array.from({ length: maxLength }, (_, i) =>
            range2.data[i]?.[index] ?? null
          );
          datasets.push({
            label: `${index} (${range2.range})`,
            data: r2,
            borderColor: color,
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            spanGaps: true,
            pointRadius: 0,
            pointHoverRadius: 3,
            segment: { borderDash: () => [8, 4] },
          });
        }
      });
    }

    return datasets;
  };

  // ─── Labels ───────────────────────────────────────────────────────────────
  const getChartLabels = () => {
    if (!isOverlayMode && Array.isArray(processedTimeseries)) {
      return processedTimeseries.map((d) => d.date);
    }
    if (isOverlayMode && timeseries.ranges.length >= 2) {
      const maxLength = Math.max(
        timeseries.ranges[0].data.length,
        timeseries.ranges[1].data.length
      );
      return Array.from({ length: maxLength }, (_, i) => `Point ${i + 1}`);
    }
    return [];
  };

  // ─── Assemble chart data ──────────────────────────────────────────────────
  const chartData = {
    labels: getChartLabels(),
    datasets: buildDatasets(),
  };

  // ─── Chart options ────────────────────────────────────────────────────────
  // NOTE: parsing:false and normalized:true are intentionally removed.
  // With plain scalar data arrays, Chart.js maps every element to its
  // corresponding label by index — all N scenes are rendered correctly.
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    animation: { duration: 150 },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 12,
          font: {
            size: 11,
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            // For raw index datasets, check interpolation flag from source data
            const isRawDataset = ["NDVI", "NDWI", "NSMI"].includes(ctx.dataset.label);
            const interpolated =
              isRawDataset &&
              processedTimeseries?.[ctx.dataIndex]?.[`${ctx.dataset.label}_interpolated`];
            const suffix = interpolated ? " (interpolated)" : "";
            return ` ${ctx.dataset.label}: ${val != null ? val.toFixed(4) : "null"}${suffix}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grace: "10%",
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          color: "#64748b",
          maxTicksLimit: 8,
        },
      },
      x: {
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          font: {
            size: 10,
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
          color: "#64748b",
          maxRotation: 45,
          minRotation: 45,
          // autoSkip hides tick labels for readability — does NOT drop data points.
          autoSkip: true,
          maxTicksLimit: 24,
        },
      },
    },
  };

  // ─── Guard: nothing to render ─────────────────────────────────────────────
  const hasChartData =
    (!isOverlayMode && Array.isArray(processedTimeseries) && processedTimeseries.length > 0) ||
    (isOverlayMode && timeseries.ranges.length >= 2);

  const allDatesProvided = dateRange1Start && dateRange1End && dateRange2Start && dateRange2End;

  if (!showModal || !isFullscreen) return null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
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
        {/* ── Header ── */}
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
            <h3 style={{ margin: "0 0 0.35rem 0", fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.025em" }}>
              📊 Analytics Dashboard
            </h3>
            {selectedPoint && (
              <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>
                📍 Location: {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
                {isOverlayMode && (
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
                background: isOverlayMode ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "white",
                border: isOverlayMode ? "2px solid #2563eb" : "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.625rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: isOverlayMode ? "white" : "#475569",
                fontWeight: "600",
                boxShadow: isOverlayMode ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => { if (!isOverlayMode) { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; } }}
              onMouseOut={(e) => { if (!isOverlayMode) { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; } }}
            >
              📅 Date Range Overlay
            </button>

            <button
              onClick={toggleFullscreen}
              style={{ background: "white", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "0.625rem 1.25rem", cursor: "pointer", fontSize: "0.875rem", color: "#475569", fontWeight: "600", transition: "all 0.2s ease" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
            >
              ← Exit Fullscreen
            </button>

            <button
              onClick={closeModal}
              style={{ background: "white", border: "2px solid #e2e8f0", borderRadius: "10px", padding: "0.625rem 0.875rem", cursor: "pointer", fontSize: "1.25rem", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, transition: "all 0.2s ease" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
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
          {/* Stats panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto" }}>
            <h4 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.025em" }}>
              Statistics Summary
            </h4>

            {stats ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <StatCard label="NDVI" value={stats.avg_ndvi} unit="Vegetation Index"
                  bgGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                  borderColor="#a7f3d0" textColor="#16a34a" unitColor="#15803d" />
                <StatCard label="NDWI" value={stats.avg_ndwi} unit="Water Index"
                  bgGradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  borderColor="#93c5fd" textColor="#2563eb" unitColor="#1d4ed8" />
                <StatCard label="NSMI" value={stats.avg_nsmi} unit="Soil Moisture Index"
                  bgGradient="linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
                  borderColor="#fdba74" textColor="#ea580c" unitColor="#c2410c" />
              </div>
            ) : (
              <div style={{ padding: "2rem 1.5rem", color: "#94a3b8", fontSize: "0.938rem", textAlign: "center", fontWeight: "500" }}>
                {isOverlayMode ? "Statistics not available in overlay mode." : "Loading statistics..."}
              </div>
            )}
          </div>

          {/* Chart panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minHeight: 0 }}>
            {/* Controls row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.625rem", background: "#f8fafc", padding: "0.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <FilterButton active={activeIndices.NDVI} onClick={() => toggleIndex("NDVI")}>🌿 NDVI</FilterButton>
                <FilterButton active={activeIndices.NDWI} onClick={() => toggleIndex("NDWI")}>💧 NDWI</FilterButton>
                <FilterButton active={activeIndices.NSMI} onClick={() => toggleIndex("NSMI")}>🏜️ NSMI</FilterButton>
              </div>

              {!isOverlayMode && (
                <div style={{ display: "flex", gap: "0.625rem", background: "#f8fafc", padding: "0.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <FilterButton active={selectedDerivatives.raw} onClick={() => toggleDerivative("raw")}>📊 Raw</FilterButton>
                  <FilterButton active={selectedDerivatives.d1} onClick={() => toggleDerivative("d1")}>📈 d1</FilterButton>
                  <FilterButton active={selectedDerivatives.d2} onClick={() => toggleDerivative("d2")}>📉 d2</FilterButton>
                </div>
              )}
            </div>

            {/* Chart container */}
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
              {hasChartData ? (
                <div style={{ width: "100%", height: "100%" }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div style={{ color: "#94a3b8", fontSize: "1rem", fontWeight: "500" }}>
                  Loading chart data...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Date Range Overlay sub-modal ── */}
      {showDateRangeModal && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1002 }}
          onClick={() => setShowDateRangeModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: "16px", padding: "2rem", maxWidth: "500px", width: "90%", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontWeight: "700", color: "#0f172a" }}>
              📅 Date Range Overlay
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Range 1 */}
              <div>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#3b82f6" }}>
                  Range 1 (Solid Line)
                </h4>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {[
                    { label: "Start Date", value: dateRange1Start, onChange: setDateRange1Start },
                    { label: "End Date",   value: dateRange1End,   onChange: setDateRange1End   },
                  ].map(({ label, value, onChange }) => (
                    <div key={label} style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "0.375rem", fontWeight: "600" }}>
                        {label}
                      </label>
                      <input
                        type="date"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ width: "100%", padding: "0.625rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", fontFamily: "inherit" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Range 2 */}
              <div>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#ef4444" }}>
                  Range 2 (Dashed Line)
                </h4>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {[
                    { label: "Start Date", value: dateRange2Start, onChange: setDateRange2Start },
                    { label: "End Date",   value: dateRange2End,   onChange: setDateRange2End   },
                  ].map(({ label, value, onChange }) => (
                    <div key={label} style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "0.375rem", fontWeight: "600" }}>
                        {label}
                      </label>
                      <input
                        type="date"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ width: "100%", padding: "0.625rem", border: "2px solid #e2e8f0", borderRadius: "8px", fontSize: "0.875rem", fontFamily: "inherit" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "0.875rem", background: "#f8fafc", borderRadius: "8px", fontSize: "0.75rem", color: "#64748b" }}>
                <strong style={{ color: "#475569" }}>Example:</strong> Compare Jun 2015–Jun 2016 with Jun 2024–Jun 2025
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                {isOverlayMode && (
                  <button
                    onClick={clearDateRangeOverlay}
                    style={{ flex: 1, padding: "0.75rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", color: "#ef4444", transition: "all 0.2s ease" }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#ef4444"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                  >
                    Clear Overlay
                  </button>
                )}

                <button
                  onClick={() => setShowDateRangeModal(false)}
                  style={{ flex: 1, padding: "0.75rem", background: "white", border: "2px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", color: "#64748b", transition: "all 0.2s ease" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  Cancel
                </button>

                <button
                  onClick={applyDateRangeOverlay}
                  disabled={!allDatesProvided}
                  style={{
                    flex: 1, padding: "0.75rem",
                    background: allDatesProvided ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "#e2e8f0",
                    border: "none", borderRadius: "10px",
                    cursor: allDatesProvided ? "pointer" : "not-allowed",
                    fontSize: "0.875rem", fontWeight: "600",
                    color: allDatesProvided ? "white" : "#94a3b8",
                    boxShadow: allDatesProvided ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
                    transition: "all 0.2s ease",
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