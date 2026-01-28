import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Line } from "react-chartjs-2";
import L from "leaflet";

// Proper marker icon fix for Vite + Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

const BACKEND_URL = "http://127.0.0.1:5000";

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

export default function MapWithTimeseries() {
  const [tileUrl, setTileUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [indexType, setIndexType] = useState("NDVI");
  const [geometry, setGeometry] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);

  const [form, setForm] = useState({
    start_date: "2020-01-01",
    end_date: "2020-12-31",
    max_cloud: 30,
  });

  // Default AOI region for testing
  useEffect(() => {
    setGeometry({
      type: "Polygon",
      coordinates: [
        [
          [81.75, 16.95],
          [81.75, 17.1],
          [81.95, 17.1],
          [81.95, 16.95],
          [81.75, 16.95],
        ],
      ],
    });
  }, []);

  const fetchComposite = async () => {
    const res = await fetch(`${BACKEND_URL}/api/composite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        geometry,
        start_date: form.start_date,
        end_date: form.end_date,
        max_cloud: Number(form.max_cloud),
        index_type: indexType,
        scale: 10,
      }),
    });

    const data = await res.json();
    if (!data.success) return alert(data.error);

    setTileUrl(data.tile_url);
    setDownloadUrl(data.download_url);
  };

  const fetchTimeseries = async (latlng) => {
    setSelectedPoint(latlng);
    setShowModal(true);
    setIsFullscreen(false);
    setPopupPosition(latlng);

    const res = await fetch(`${BACKEND_URL}/api/timeseries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        point: { lat: latlng.lat, lng: latlng.lng },
        start_date: form.start_date,
        end_date: form.end_date,
        max_cloud: Number(form.max_cloud),
      }),
    });

    const data = await res.json();
    if (!data.success) return alert(data.error);

    setTimeseries(data.data);
    setStats(data.statistics);
  };

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
        position: 'top',
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div style={{ 
      width: "100%",
      height: "100vh",
      fontFamily: "'Times New Roman', Times, serif",
      background: "#f8fafc",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Fixed Top Control Panel */}
      <div style={{ 
        background: "white", 
        padding: "1.5rem", 
        borderBottom: "2px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        flexShrink: 0
      }}>
        <h2 style={{ 
          margin: "0 0 1rem 0", 
          fontSize: "1.5rem", 
          fontWeight: "normal",
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          🌍 Satellite Indices Viewer
        </h2>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr 100px 140px auto 1fr", 
          gap: "0.75rem",
          alignItems: "end"
        }}>
          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.75rem", 
              fontWeight: "500", 
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif"
            }}>Start Date</label>
            <input 
              type="date" 
              value={form.start_date} 
              onChange={(e) => setForm({ ...form, start_date: e.target.value })} 
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1.5px solid #e2e8f0",
                borderRadius: "4px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s",
                background: "white",
                fontFamily: "'Times New Roman', Times, serif"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.75rem", 
              fontWeight: "500", 
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif"
            }}>End Date</label>
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
                fontFamily: "'Times New Roman', Times, serif"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.75rem", 
              fontWeight: "500", 
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif"
            }}>Cloud %</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={form.max_cloud} 
              onChange={(e) => setForm({ ...form, max_cloud: e.target.value })} 
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1.5px solid #e2e8f0",
                borderRadius: "4px",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s",
                background: "white",
                fontFamily: "'Times New Roman', Times, serif"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div>
            <label style={{ 
              display: "block", 
              fontSize: "0.75rem", 
              fontWeight: "500", 
              color: "#64748b",
              marginBottom: "0.25rem",
              fontFamily: "'Times New Roman', Times, serif"
            }}>Index Type</label>
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
                fontFamily: "'Times New Roman', Times, serif"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            >
              <option value="NDVI">NDVI</option>
              <option value="NDWI">NDWI</option>
              <option value="NSMI">NSMI</option>
              <option value="TRUE_COLOR">True Color</option>
            </select>
          </div>

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
              fontFamily: "'Times New Roman', Times, serif"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 6px rgba(37, 99, 235, 0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Load Composite
          </button>

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
                fontFamily: "'Times New Roman', Times, serif"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#eff6ff";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 6px rgba(59, 130, 246, 0.2)";
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

      {/* Map Container with Padding */}
      <div style={{
        flex: 1,
        padding: "10px",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "relative"
        }}>
          <MapContainer center={[17.0, 81.8]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="&copy; Esri — Imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {tileUrl && <TileLayer url={tileUrl} opacity={0.7} />}
            {selectedPoint && <Marker position={[selectedPoint.lat, selectedPoint.lng]} />}
            <ClickHandler onClick={(latlng) => fetchTimeseries(latlng)} />
          </MapContainer>

          {/* Floating Popup - Positioned Beside Point */}
          {showModal && !isFullscreen && (
            <div style={{
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
              right: "20px"
            }}>
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
              <div style={{
                padding: "1rem",
                borderBottom: "1.5px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
                flexShrink: 0
              }}>
                <div>
                  <h4 style={{ 
                    margin: "0 0 0.25rem 0", 
                    fontSize: "1rem", 
                    fontWeight: "normal",
                    color: "#1e293b",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    📈 Analytics
                  </h4>
                  {selectedPoint && (
                    <div style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
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
                      fontFamily: "'Times New Roman', Times, serif"
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
                      fontFamily: "'Times New Roman', Times, serif"
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
              <div style={{
                flex: 1,
                overflow: "auto",
                padding: "1rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem"
              }}>
                {/* Left Side - Statistics */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}>
                  <h5 style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    📊 Stats
                  </h5>

                  {stats ? (
                    <>
                      <div style={{
                        padding: "0.6rem 0.8rem",
                        background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                        borderRadius: "4px",
                        border: "1.5px solid #a7f3d0"
                      }}>
                        <div style={{ fontSize: "0.7rem", color: "#065f46", fontWeight: "600", marginBottom: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>NDVI</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "normal", color: "#047857", fontFamily: "'Times New Roman', Times, serif" }}>{stats.avg_ndvi}</div>
                        <div style={{ fontSize: "0.65rem", color: "#059669", marginTop: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>Vegetation</div>
                      </div>

                      <div style={{
                        padding: "0.6rem 0.8rem",
                        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                        borderRadius: "4px",
                        border: "1.5px solid #93c5fd"
                      }}>
                        <div style={{ fontSize: "0.7rem", color: "#1e40af", fontWeight: "600", marginBottom: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>NDWI</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "normal", color: "#1d4ed8", fontFamily: "'Times New Roman', Times, serif" }}>{stats.avg_ndwi}</div>
                        <div style={{ fontSize: "0.65rem", color: "#2563eb", marginTop: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>Water</div>
                      </div>

                      <div style={{
                        padding: "0.6rem 0.8rem",
                        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                        borderRadius: "4px",
                        border: "1.5px solid #fcd34d"
                      }}>
                        <div style={{ fontSize: "0.7rem", color: "#92400e", fontWeight: "600", marginBottom: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>NSMI</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: "normal", color: "#b45309", fontFamily: "'Times New Roman', Times, serif" }}>{stats.avg_nsmi}</div>
                        <div style={{ fontSize: "0.65rem", color: "#d97706", marginTop: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>Soil</div>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      padding: "1rem",
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
                      Loading...
                    </div>
                  )}
                </div>

                {/* Right Side - Chart */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}>
                  <h5 style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    📉 Trend
                  </h5>

                  {timeseries.length > 0 ? (
                    <div style={{
                      flex: 1,
                      minHeight: "280px",
                      background: "#f8fafc",
                      borderRadius: "4px",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0"
                    }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div style={{
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
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
                      Loading chart...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Modal */}
      {showModal && isFullscreen && (
        <div style={{
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
          fontFamily: "'Times New Roman', Times, serif"
        }}>
          {/* Modal Content */}
          <div style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            width: "100%",
            height: "100%",
            maxHeight: "calc(100vh - 20px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'Times New Roman', Times, serif"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "2rem",
              borderBottom: "2px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              background: "#f8fafc"
            }}>
              <div>
                <h3 style={{ 
                  margin: "0 0 0.5rem 0", 
                  fontSize: "1.75rem", 
                  fontWeight: "normal",
                  color: "#1e293b",
                  fontFamily: "'Times New Roman', Times, serif"
                }}>
                  📈 Time-Series Analytics
                </h3>
                {selectedPoint && (
                  <div style={{
                    fontSize: "0.95rem",
                    color: "#64748b",
                    fontWeight: "normal",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    📍 Location: {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
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
                    fontFamily: "'Times New Roman', Times, serif"
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
                    fontFamily: "'Times New Roman', Times, serif"
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
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: "2rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem"
            }}>
              {/* Left Side - Statistics */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}>
                <h4 style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "normal",
                  color: "#1e293b",
                  fontFamily: "'Times New Roman', Times, serif"
                }}>
                  📊 Statistics Summary
                </h4>

                {stats ? (
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr",
                    gap: "0.75rem"
                  }}>
                    <div style={{
                      padding: "0.6rem 0.8rem",
                      background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                      borderRadius: "4px",
                      border: "1.5px solid #a7f3d0"
                    }}>
                      <div style={{ fontSize: "0.7rem", color: "#065f46", fontWeight: "600", marginBottom: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>NDVI</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "normal", color: "#047857", fontFamily: "'Times New Roman', Times, serif" }}>{stats.avg_ndvi}</div>
                      <div style={{ fontSize: "0.65rem", color: "#059669", marginTop: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>Vegetation</div>
                    </div>

                    <div style={{
                      padding: "0.6rem 0.8rem",
                      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      borderRadius: "4px",
                      border: "1.5px solid #93c5fd"
                    }}>
                      <div style={{ fontSize: "0.7rem", color: "#1e40af", fontWeight: "600", marginBottom: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>NDWI</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "normal", color: "#1d4ed8", fontFamily: "'Times New Roman', Times, serif" }}>{stats.avg_ndwi}</div>
                      <div style={{ fontSize: "0.65rem", color: "#2563eb", marginTop: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>Water</div>
                    </div>

                    <div style={{
                      padding: "0.6rem 0.8rem",
                      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                      borderRadius: "4px",
                      border: "1.5px solid #fcd34d"
                    }}>
                      <div style={{ fontSize: "0.7rem", color: "#92400e", fontWeight: "600", marginBottom: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>NSMI</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "normal", color: "#b45309", fontFamily: "'Times New Roman', Times, serif" }}>{stats.avg_nsmi}</div>
                      <div style={{ fontSize: "0.65rem", color: "#d97706", marginTop: "0.15rem", fontFamily: "'Times New Roman', Times, serif" }}>Soil</div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: "1.5rem 1rem",
                    color: "#94a3b8",
                    fontSize: "0.95rem",
                    textAlign: "center",
                    fontFamily: "'Times New Roman', Times, serif"
                  }}>
                    Loading statistics...
                  </div>
                )}
              </div>

              {/* Right Side - Chart */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}>
                <h4 style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "normal",
                  color: "#1e293b",
                  fontFamily: "'Times New Roman', Times, serif"
                }}>
                  📉 Time Series Trend
                </h4>

                <div style={{
                  flex: 1,
                  minHeight: "400px",
                  background: "#f8fafc",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  border: "1px solid #e2e8f0"
                }}>
                  {timeseries.length > 0 ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      fontSize: "1rem",
                      fontFamily: "'Times New Roman', Times, serif"
                    }}>
                      Loading chart...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}