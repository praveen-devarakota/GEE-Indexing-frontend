import React, { useState, useEffect, useRef } from "react";
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
  const [mapInstance, setMapInstance] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPopupPos, setCustomPopupPos] = useState(null);
  
  const popupRef = useRef(null);

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

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && popupRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport
      const rect = popupRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      setCustomPopupPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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
    setCustomPopupPos(null); // Reset custom position when opening new popup
    
    // Calculate pixel position for popup
    if (mapInstance) {
      const point = mapInstance.latLngToContainerPoint(latlng);
      setPopupPosition({ x: point.x, y: point.y });
    }

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
    const avg = (key) =>
  (data.data.reduce((s, d) => s + d[key], 0) / data.data.length).toFixed(4);

setStats({
  avg_ndvi: avg("NDVI"),
  avg_ndwi: avg("NDWI"),
  avg_nsmi: avg("NSMI"),
});
  };

  const chartData = {
    labels: timeseries.map((d) => d.date),
    datasets: [
      {
        label: "NDVI",
        data: timeseries.map((d) => d.NDVI),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "NDWI",
        data: timeseries.map((d) => d.NDWI),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "NSMI",
        data: timeseries.map((d) => d.NSMI),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        usePointStyle: true,
        font: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          },
          color: '#64748b'
        }
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          },
          color: '#64748b',
          maxRotation: 45,
          minRotation: 45
        }
      },
    },
  };

  const closeModal = () => {
    setShowModal(false);
    setCustomPopupPos(null);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Calculate final popup position
  const getPopupStyle = () => {
    if (customPopupPos) {
      return {
        left: `${customPopupPos.x}px`,
        top: `${customPopupPos.y}px`
      };
    }
    
    if (popupPosition) {
      const leftPosition = popupPosition.x > window.innerWidth / 2 
        ? popupPosition.x - 560 
        : popupPosition.x + 80;
      const topPosition = Math.max(40, Math.min(popupPosition.y - 180, window.innerHeight - 400));
      
      return {
        left: `${leftPosition}px`,
        top: `${topPosition}px`
      };
    }
    
    return {};
  };

  return (
    <div style={{ 
      width: "100%",
      height: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes geniePopup {
          0% {
            opacity: 0;
            transform: scale(0) translateY(50px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes dashAnimation {
          to {
            stroke-dashoffset: -10;
          }
        }
        
        .drag-handle {
          cursor: move;
          user-select: none;
        }
        
        .drag-handle:active {
          cursor: grabbing;
        }
      `}</style>

      {/* Modern Top Control Panel */}
      <div style={{ 
        background: "rgba(255, 255, 255, 0.95)", 
        backdropFilter: "blur(10px)",
        padding: "1.75rem 2rem", 
        borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        flexShrink: 0,
        animation: "slideInFromTop 0.5s ease-out"
      }}>
        <div style={{
          maxWidth: "1600px",
          margin: "0 auto"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem"
          }}>
            <h2 style={{ 
              margin: "0", 
              fontSize: "1.75rem", 
              fontWeight: "700",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              letterSpacing: "-0.025em"
            }}>
              <span style={{
                fontSize: "2rem",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}>🛰️</span>
              Satellite Indices Viewer
            </h2>
            
            <div style={{
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              borderRadius: "8px",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
            }}>
              Dashboard
            </div>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
            gap: "1rem",
            alignItems: "end"
          }}>
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.813rem", 
                fontWeight: "600", 
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em"
              }}>Start Date</label>
              <input 
                type="date" 
                value={form.start_date} 
                onChange={(e) => setForm({ ...form, start_date: e.target.value })} 
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
                  color: "#1e293b"
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

            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.813rem", 
                fontWeight: "600", 
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em"
              }}>End Date</label>
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
                  color: "#1e293b"
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

            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.813rem", 
                fontWeight: "600", 
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em"
              }}>Cloud Coverage</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={form.max_cloud} 
                onChange={(e) => setForm({ ...form, max_cloud: e.target.value })} 
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
                  color: "#1e293b"
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

            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.813rem", 
                fontWeight: "600", 
                color: "#475569",
                marginBottom: "0.5rem",
                letterSpacing: "0.01em"
              }}>Index Type</label>
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
                  color: "#1e293b"
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
                letterSpacing: "0.01em"
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
                  letterSpacing: "0.01em"
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

      {/* Map Container with Modern Styling */}
      <div style={{
        flex: 1,
        padding: "1.5rem",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          position: "relative",
          animation: "fadeIn 0.5s ease-out 0.2s both"
        }}>
          <MapContainer center={[17.0, 81.8]} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="&copy; Esri — Imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {tileUrl && <TileLayer url={tileUrl} opacity={0.7} />}
            {selectedPoint && <Marker position={[selectedPoint.lat, selectedPoint.lng]} />}
            <MapEvents setMapInstance={setMapInstance} />
            <ClickHandler onClick={(latlng) => fetchTimeseries(latlng)} />
          </MapContainer>

          {/* Modern Draggable Floating Popup */}
          {showModal && !isFullscreen && popupPosition && (
            <>
              {/* Connection line from pointer to popup - only show if not custom positioned */}
              {!customPopupPos && (
                <svg style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 999
                }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 0.2 }} />
                    </linearGradient>
                  </defs>
                  <line
                    x1={popupPosition.x}
                    y1={popupPosition.y}
                    x2={popupPosition.x > window.innerWidth / 2 ? popupPosition.x - 80 : popupPosition.x + 80}
                    y2={Math.max(60, Math.min(popupPosition.y, window.innerHeight - 200))}
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    style={{
                      animation: "dashAnimation 1s linear infinite"
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
                  animation: customPopupPos ? "none" : "geniePopup 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  pointerEvents: "auto",
                  transformOrigin: popupPosition.x > window.innerWidth / 2 ? "right center" : "left center",
                  transition: isDragging ? "none" : "box-shadow 0.2s ease"
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
                  background: "linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)",
                  flexShrink: 0
                }}
              >
                <div style={{ pointerEvents: "none" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    marginBottom: "0.15rem"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>⋮⋮</span>
                    <h4 style={{ 
                      margin: "0", 
                      fontSize: "1rem", 
                      fontWeight: "700",
                      color: "#0f172a",
                      letterSpacing: "-0.025em"
                    }}>
                      📊 Analytics Dashboard
                    </h4>
                  </div>
                  {selectedPoint && (
                    <div style={{
                      fontSize: "0.688rem",
                      color: "#64748b",
                      fontWeight: "500",
                      marginTop: "0.15rem",
                      marginLeft: "1.5rem"
                    }}>
                      📍 {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", pointerEvents: "auto" }}>
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
                      justifyContent: "center"
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
                      justifyContent: "center"
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
              <div style={{
                flex: 1,
                overflow: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}>
                {/* Statistics Cards */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem"
                }}>
                  <h5 style={{
                    margin: "0 0 0.25rem 0",
                    fontSize: "0.813rem",
                    fontWeight: "700",
                    color: "#0f172a",
                    letterSpacing: "-0.01em"
                  }}>
                    Statistics
                  </h5>

                  {stats ? (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.5rem"
                    }}>
                      <div style={{
                        padding: "0.75rem",
                        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                        borderRadius: "10px",
                        border: "1px solid #a7f3d0",
                        boxShadow: "0 2px 4px rgba(16, 185, 129, 0.1)"
                      }}>
                        <div style={{ 
                          fontSize: "0.625rem", 
                          color: "#065f46", 
                          fontWeight: "700", 
                          marginBottom: "0.35rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}>NDVI</div>
                        <div style={{ 
                          fontSize: "1.5rem", 
                          fontWeight: "700", 
                          color: "#059669",
                          marginBottom: "0.15rem"
                        }}>{stats.avg_ndvi}</div>
                        <div style={{ 
                          fontSize: "0.563rem", 
                          color: "#047857",
                          fontWeight: "600"
                        }}>Vegetation</div>
                      </div>

                      <div style={{
                        padding: "0.75rem",
                        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                        borderRadius: "10px",
                        border: "1px solid #93c5fd",
                        boxShadow: "0 2px 4px rgba(59, 130, 246, 0.1)"
                      }}>
                        <div style={{ 
                          fontSize: "0.625rem", 
                          color: "#1e40af", 
                          fontWeight: "700", 
                          marginBottom: "0.35rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}>NDWI</div>
                        <div style={{ 
                          fontSize: "1.5rem", 
                          fontWeight: "700", 
                          color: "#2563eb",
                          marginBottom: "0.15rem"
                        }}>{stats.avg_ndwi}</div>
                        <div style={{ 
                          fontSize: "0.563rem", 
                          color: "#1d4ed8",
                          fontWeight: "600"
                        }}>Water</div>
                      </div>

                      <div style={{
                        padding: "0.75rem",
                        background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                        borderRadius: "10px",
                        border: "1px solid #fcd34d",
                        boxShadow: "0 2px 4px rgba(245, 158, 11, 0.1)"
                      }}>
                        <div style={{ 
                          fontSize: "0.625rem", 
                          color: "#92400e", 
                          fontWeight: "700", 
                          marginBottom: "0.35rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}>NSMI</div>
                        <div style={{ 
                          fontSize: "1.5rem", 
                          fontWeight: "700", 
                          color: "#d97706",
                          marginBottom: "0.15rem"
                        }}>{stats.avg_nsmi}</div>
                        <div style={{ 
                          fontSize: "0.563rem", 
                          color: "#b45309",
                          fontWeight: "600"
                        }}>Soil</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      padding: "1rem",
                      fontWeight: "500"
                    }}>
                      Loading statistics...
                    </div>
                  )}
                </div>

                {/* Chart Section */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  flex: 1
                }}>
                  <h5 style={{
                    margin: "0 0 0.25rem 0",
                    fontSize: "0.813rem",
                    fontWeight: "700",
                    color: "#0f172a",
                    letterSpacing: "-0.01em"
                  }}>
                    Time Series
                  </h5>

                  {timeseries.length > 0 ? (
                    <div style={{
                      flex: 1,
                      minHeight: "200px",
                      background: "white",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)"
                    }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div style={{
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
                      fontWeight: "500"
                    }}>
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

      {/* Full Screen Modal */}
      {showModal && isFullscreen && (
        <div style={{
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
          animation: "fadeIn 0.2s ease-out"
        }}>
          {/* Modal Content */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.4)",
            width: "100%",
            height: "100%",
            maxWidth: "1400px",
            maxHeight: "calc(100vh - 3rem)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "1.25rem 2rem",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
            }}>
              <div>
                <h3 style={{ 
                  margin: "0 0 0.35rem 0", 
                  fontSize: "1.5rem", 
                  fontWeight: "700",
                  color: "#0f172a",
                  letterSpacing: "-0.025em"
                }}>
                  📊 Analytics Dashboard
                </h3>
                {selectedPoint && (
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                    fontWeight: "500"
                  }}>
                    📍 Location: {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
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
                    fontWeight: "600"
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
                    lineHeight: 1
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
            <div style={{
              flex: 1,
              overflow: "hidden",
              padding: "1.5rem 2rem",
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: "2rem"
            }}>
              {/* Left Side - Statistics */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflow: "auto"
              }}>
                <h4 style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  letterSpacing: "-0.025em"
                }}>
                  Statistics Summary
                </h4>

                {stats ? (
                  <div style={{ 
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.875rem"
                  }}>
                    <div style={{
                      padding: "1.25rem",
                      background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                      borderRadius: "14px",
                      border: "1px solid #a7f3d0",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)"
                    }}>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#065f46", 
                        fontWeight: "700", 
                        marginBottom: "0.625rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>NDVI</div>
                      <div style={{ 
                        fontSize: "2.25rem", 
                        fontWeight: "700", 
                        color: "#059669",
                        marginBottom: "0.375rem",
                        lineHeight: 1
                      }}>{stats.avg_ndvi}</div>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#047857",
                        fontWeight: "600"
                      }}>Vegetation Index</div>
                    </div>

                    <div style={{
                      padding: "1.25rem",
                      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      borderRadius: "14px",
                      border: "1px solid #93c5fd",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)"
                    }}>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#1e40af", 
                        fontWeight: "700", 
                        marginBottom: "0.625rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>NDWI</div>
                      <div style={{ 
                        fontSize: "2.25rem", 
                        fontWeight: "700", 
                        color: "#2563eb",
                        marginBottom: "0.375rem",
                        lineHeight: 1
                      }}>{stats.avg_ndwi}</div>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#1d4ed8",
                        fontWeight: "600"
                      }}>Water Index</div>
                    </div>

                    <div style={{
                      padding: "1.25rem",
                      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                      borderRadius: "14px",
                      border: "1px solid #fcd34d",
                      boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)"
                    }}>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#92400e", 
                        fontWeight: "700", 
                        marginBottom: "0.625rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>NSMI</div>
                      <div style={{ 
                        fontSize: "2.25rem", 
                        fontWeight: "700", 
                        color: "#d97706",
                        marginBottom: "0.375rem",
                        lineHeight: 1
                      }}>{stats.avg_nsmi}</div>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#b45309",
                        fontWeight: "600"
                      }}>Soil Moisture Index</div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: "2rem 1.5rem",
                    color: "#94a3b8",
                    fontSize: "0.938rem",
                    textAlign: "center",
                    fontWeight: "500"
                  }}>
                    Loading statistics...
                  </div>
                )}
              </div>

              {/* Right Side - Chart */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                minHeight: 0
              }}>
                <h4 style={{
                  margin: "0",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  letterSpacing: "-0.025em"
                }}>
                  Time Series Analysis
                </h4>

                <div style={{
                  flex: 1,
                  background: "white",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {timeseries.length > 0 ? (
                    <div style={{ width: "100%", height: "100%" }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div style={{
                      color: "#94a3b8",
                      fontSize: "1rem",
                      fontWeight: "500"
                    }}>
                      Loading chart data...
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