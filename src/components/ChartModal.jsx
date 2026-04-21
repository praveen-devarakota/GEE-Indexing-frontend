import React, { useState, useRef, useEffect } from "react";
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

// ─── Chatbot Panel ──────────────────────────────────────────────────────────
function ChatbotPanel({ timeseries, stats, selectedPoint, isOverlayMode, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const hasData =
      (!isOverlayMode && Array.isArray(timeseries) && timeseries.length > 0) ||
      (isOverlayMode && timeseries?.ranges?.length >= 2);

    if (hasData && !isAnalyzed && !isAnalyzing) {
      analyzeData();
    }
  }, []);

  const analyzeData = async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const rawData = isOverlayMode ? timeseries?.ranges : timeseries;

      const res = await fetch("https://satellite-index-viewer-backend-1.onrender.com/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: rawData }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const responseJson = await res.json();

      if (!responseJson.success) {
        throw new Error(responseJson.error || "Analysis failed");
      }

      const analysis = responseJson.analysis;
      const greeting =
        analysis?.summary ||
        "✅ Analysis complete! Ask me anything about the NDVI trends, anomalies, or patterns.";

      setIsAnalyzed(true);
      setMessages([{ role: "assistant", text: greeting }]);
    } catch (err) {
      setAnalyzeError(err.message);
      setMessages([
        {
          role: "assistant",
          text: `⚠️ Could not connect to the analysis service. Please ensure the backend is running.\n\nError: ${err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("https://satellite-index-viewer-backend-1.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const responseJson = await res.json();

      if (!responseJson.success) {
        throw new Error(responseJson.error || "Chat failed");
      }

      let replyText = responseJson.answer;
      if (typeof replyText === "object" && replyText !== null) {
        replyText = replyText.answer ?? JSON.stringify(replyText);
      }
      if (typeof replyText !== "string") {
        replyText = String(replyText ?? "No response received.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: replyText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ Failed to get a response.\n\nError: ${err.message}`,
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "5.5rem",
        right: "2rem",
        width: "380px",
        maxHeight: "520px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(99,102,241,0.12)",
        border: "1px solid #e0e7ff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1010,
        animation: "chatSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        .chat-input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .chat-send-btn:hover:not(:disabled) { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important; transform: scale(1.04); }
        .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-msg-bubble { animation: chatSlideUp 0.18s ease; }
        .retry-btn:hover { background: #ede9fe !important; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "0.9rem", lineHeight: 1.2 }}>
              Curve Analyst AI
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.7rem" }}>
              {isAnalyzing
                ? "Analyzing data…"
                : isAnalyzed
                ? "● Ready to chat"
                : analyzeError
                ? "● Connection error"
                : "Initializing…"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)", border: "none",
            borderRadius: "8px", width: "28px", height: "28px",
            cursor: "pointer", color: "white", fontSize: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1, overflowY: "auto", padding: "1rem",
          display: "flex", flexDirection: "column", gap: "0.625rem",
          background: "#fafafa",
        }}
      >
        {isAnalyzing && messages.length === 0 && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>
              🤖
            </div>
            <div
              style={{
                background: "white", borderRadius: "0 12px 12px 12px",
                padding: "0.75rem 1rem",
                border: "1px solid #e0e7ff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: "0.375rem",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "#6366f1", fontWeight: "600" }}>Analyzing curve data</span>
              {[0, 0.15, 0.3].map((delay, i) => (
                <span
                  key={i}
                  style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: "#6366f1", display: "inline-block",
                    animation: `dotPulse 1.2s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="chat-msg-bubble"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: "82%",
                padding: "0.625rem 0.875rem",
                borderRadius: msg.role === "user" ? "12px 0 12px 12px" : "0 12px 12px 12px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  : msg.isError
                  ? "#fef2f2"
                  : "white",
                color: msg.role === "user" ? "white" : msg.isError ? "#dc2626" : "#1e293b",
                fontSize: "0.825rem",
                lineHeight: 1.55,
                border: msg.role === "user" ? "none" : `1px solid ${msg.isError ? "#fecaca" : "#e0e7ff"}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isSending && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>
              🤖
            </div>
            <div style={{ background: "white", borderRadius: "0 12px 12px 12px", padding: "0.75rem 1rem", border: "1px solid #e0e7ff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "4px", alignItems: "center" }}>
              {[0, 0.15, 0.3].map((delay, i) => (
                <span
                  key={i}
                  style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#6366f1", display: "inline-block",
                    animation: `dotPulse 1.2s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {analyzeError && !isAnalyzing && (
          <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <button
              className="retry-btn"
              onClick={analyzeData}
              style={{
                background: "#f5f3ff", border: "1px solid #c4b5fd",
                borderRadius: "8px", padding: "0.4rem 1rem",
                cursor: "pointer", fontSize: "0.75rem",
                color: "#7c3aed", fontWeight: "600",
                transition: "background 0.15s",
              }}
            >
              🔄 Retry Connection
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1px solid #e0e7ff",
          background: "white",
          display: "flex",
          gap: "0.5rem",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAnalyzed ? "Ask about the NDVI curve…" : "Waiting for analysis…"}
          disabled={!isAnalyzed || isSending}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            border: "1.5px solid #e0e7ff",
            borderRadius: "10px",
            padding: "0.55rem 0.75rem",
            fontSize: "0.825rem",
            fontFamily: "inherit",
            color: "#1e293b",
            background: isAnalyzed ? "white" : "#f8fafc",
            transition: "border-color 0.2s, box-shadow 0.2s",
            lineHeight: 1.4,
            maxHeight: "80px",
            overflowY: "auto",
          }}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={!isAnalyzed || !input.trim() || isSending}
          style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none", borderRadius: "10px",
            cursor: "pointer", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", flexShrink: 0,
            transition: "all 0.18s ease",
            boxShadow: "0 4px 10px rgba(99,102,241,0.3)",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ─── Main ChartModal ────────────────────────────────────────────────────────
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
  // NDVI only — removed NDWI and NSMI
  const [activeIndices, setActiveIndices] = useState({ NDVI: true });
  const [selectedDerivatives, setSelectedDerivatives] = useState({ raw: true, d1: false, d2: false });
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRange1Start, setDateRange1Start] = useState("");
  const [dateRange1End, setDateRange1End] = useState("");
  const [dateRange2Start, setDateRange2Start] = useState("");
  const [dateRange2End, setDateRange2End] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);

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

  // ─── Dataset builder — NDVI only ─────────────────────────────────────────
  const buildDatasets = () => {
    const datasets = [];
    const ndviColors = { primary: "#22c55e", secondary: "#16a34a", tertiary: "#15803d" };

    if (!activeIndices.NDVI) return datasets;

    if (!isOverlayMode && Array.isArray(processedTimeseries)) {
      if (selectedDerivatives.d2) {
        datasets.push({
          label: "NDVI (d2)",
          data: processedTimeseries.map((d) => d["NDVI_d2"] ?? null),
          borderColor: ndviColors.tertiary,
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
          label: "NDVI (d1)",
          data: processedTimeseries.map((d) => d["NDVI_d1"] ?? null),
          borderColor: ndviColors.secondary,
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
          label: "NDVI",
          data: processedTimeseries.map((d) => d["NDVI"] ?? null),
          borderColor: ndviColors.primary,
          backgroundColor: `${ndviColors.primary}18`,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          spanGaps: true,
          pointRadius: (ctx) =>
            processedTimeseries[ctx.dataIndex]?.["NDVI_interpolated"] ? 0 : 2,
          pointStyle: (ctx) =>
            processedTimeseries[ctx.dataIndex]?.["NDVI_interpolated"] ? "dash" : "circle",
          pointHoverRadius: 4,
          order: 1,
        });
      }
    } else if (isOverlayMode && timeseries.ranges.length >= 2) {
      const range1 = timeseries.ranges[0];
      const range2 = timeseries.ranges[1];
      const maxLength = Math.max(range1.data.length, range2.data.length);

      if (selectedDerivatives.raw) {
        const r1 = Array.from({ length: maxLength }, (_, i) =>
          range1.data[i]?.NDVI ?? null
        );
        datasets.push({
          label: `NDVI (${range1.range})`,
          data: r1,
          borderColor: ndviColors.primary,
          borderWidth: 2.5,
          fill: false,
          tension: 0.4,
          spanGaps: true,
          pointRadius: 2,
          pointHoverRadius: 4,
        });

        const r2 = Array.from({ length: maxLength }, (_, i) =>
          range2.data[i]?.NDVI ?? null
        );
        datasets.push({
          label: `NDVI (${range2.range})`,
          data: r2,
          borderColor: ndviColors.secondary,
          borderWidth: 2.5,
          fill: false,
          tension: 0.4,
          spanGaps: true,
          pointRadius: 0,
          pointHoverRadius: 3,
          segment: { borderDash: () => [8, 4] },
        });
      }
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

  const chartData = {
    labels: getChartLabels(),
    datasets: buildDatasets(),
  };

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
            const isRaw = ctx.dataset.label === "NDVI";
            const interpolated =
              isRaw &&
              processedTimeseries?.[ctx.dataIndex]?.["NDVI_interpolated"];
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
          autoSkip: true,
          maxTicksLimit: 24,
        },
      },
    },
  };

  const hasChartData =
    (!isOverlayMode && Array.isArray(processedTimeseries) && processedTimeseries.length > 0) ||
    (isOverlayMode && timeseries.ranges.length >= 2);

  const allDatesProvided = dateRange1Start && dateRange1End && dateRange2Start && dateRange2End;

  if (!showModal || !isFullscreen) return null;

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
          position: "relative",
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
            {/* AI Chatbot button */}
            <button
              onClick={() => setShowChatbot((prev) => !prev)}
              style={{
                background: showChatbot
                  ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                  : "white",
                border: showChatbot ? "2px solid #6366f1" : "2px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.625rem 1.25rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: showChatbot ? "white" : "#475569",
                fontWeight: "600",
                boxShadow: showChatbot ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
              onMouseOver={(e) => {
                if (!showChatbot) {
                  e.currentTarget.style.background = "#f5f3ff";
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.color = "#6366f1";
                }
              }}
              onMouseOut={(e) => {
                if (!showChatbot) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              🤖 AI Chat
            </button>

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
          {/* Stats panel — NDVI only */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto" }}>
            <h4 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.025em" }}>
              Statistics Summary
            </h4>

            {stats ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <StatCard
                  label="NDVI"
                  value={stats.avg_ndvi}
                  unit="Vegetation Index"
                  bgGradient="linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                  borderColor="#a7f3d0"
                  textColor="#16a34a"
                  unitColor="#15803d"
                />
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
              {/* Index toggle — NDVI only */}
              <div style={{ display: "flex", gap: "0.625rem", background: "#f8fafc", padding: "0.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <FilterButton active={activeIndices.NDVI} onClick={() => toggleIndex("NDVI")}>🌿 NDVI</FilterButton>
              </div>

              {/* Derivative toggles — unchanged */}
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

        {/* Chatbot panel */}
        {showChatbot && hasChartData && (
          <ChatbotPanel
            timeseries={isOverlayMode ? timeseries : processedTimeseries}
            stats={stats}
            selectedPoint={selectedPoint}
            isOverlayMode={isOverlayMode}
            onClose={() => setShowChatbot(false)}
          />
        )}
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