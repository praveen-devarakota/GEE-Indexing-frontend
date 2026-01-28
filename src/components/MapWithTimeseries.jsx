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

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "1fr 450px", 
      gap: "1.5rem", 
      height: "100vh", 
      padding: "1.5rem",
      background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Left Panel - Map */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ 
            margin: "0 0 1rem 0", 
            fontSize: "1.5rem", 
            fontWeight: "600",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            🌍 Satellite Indices Viewer
          </h2>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 100px 140px auto", 
            gap: "0.75rem",
            alignItems: "end"
          }}>
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.75rem", 
                fontWeight: "500", 
                color: "#64748b",
                marginBottom: "0.25rem"
              }}>Start Date</label>
              <input 
                type="date" 
                value={form.start_date} 
                onChange={(e) => setForm({ ...form, start_date: e.target.value })} 
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "white"
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
                marginBottom: "0.25rem"
              }}>End Date</label>
              <input 
                type="date" 
                value={form.end_date} 
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} 
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "white"
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
                marginBottom: "0.25rem"
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
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "white"
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
                marginBottom: "0.25rem"
              }}>Index Type</label>
              <select 
                value={indexType} 
                onChange={(e) => setIndexType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.2s",
                  background: "white",
                  cursor: "pointer"
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
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
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
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          border: "1.5px solid #e2e8f0", 
          borderRadius: "12px", 
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          background: "white"
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
        </div>

        {downloadUrl && (
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.25rem",
              background: "white",
              color: "#3b82f6",
              border: "1.5px solid #3b82f6",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "500",
              textDecoration: "none",
              transition: "all 0.2s",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
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
            📥 Download Cloud-Masked {indexType} GeoTIFF
          </a>
        )}
      </div>

      {/* Right Panel - Time Series */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "1rem"
      }}>
        <div style={{ 
          background: "white", 
          padding: "1.25rem", 
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1.5px solid #e2e8f0"
        }}>
          <h3 style={{ 
            margin: "0 0 0.75rem 0", 
            fontSize: "1.125rem", 
            fontWeight: "600",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            📈 Time-Series Analytics
          </h3>
          
          {selectedPoint && (
            <div style={{
              padding: "0.625rem",
              background: "#f8fafc",
              borderRadius: "6px",
              fontSize: "0.8rem",
              color: "#475569",
              border: "1.5px solid #e2e8f0",
              marginBottom: "0.75rem"
            }}>
              <span style={{ fontWeight: "500" }}>📍</span> {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
            </div>
          )}
          
          {stats && (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem"
            }}>
              <div style={{
                padding: "0.5rem",
                background: "linear-gradient(to right, #ecfdf5, #f0fdf4)",
                borderRadius: "6px",
                border: "1.5px solid #a7f3d0"
              }}>
                <div style={{ fontSize: "0.65rem", color: "#065f46", fontWeight: "500" }}>NDVI</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#047857" }}>{stats.avg_ndvi}</div>
              </div>
              <div style={{
                padding: "0.5rem",
                background: "linear-gradient(to right, #eff6ff, #dbeafe)",
                borderRadius: "6px",
                border: "1.5px solid #93c5fd"
              }}>
                <div style={{ fontSize: "0.65rem", color: "#1e40af", fontWeight: "500" }}>NDWI</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1d4ed8" }}>{stats.avg_ndwi}</div>
              </div>
              <div style={{
                padding: "0.5rem",
                background: "linear-gradient(to right, #fffbeb, #fef3c7)",
                borderRadius: "6px",
                border: "1.5px solid #fcd34d"
              }}>
                <div style={{ fontSize: "0.65rem", color: "#92400e", fontWeight: "500" }}>NSMI</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#b45309" }}>{stats.avg_nsmi}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          flex: 1,
          background: "white", 
          padding: "1.25rem", 
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1.5px solid #e2e8f0",
          display: "flex",
          flexDirection: "column"
        }}>
          {timeseries.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "0.875rem",
              textAlign: "center",
              padding: "2rem"
            }}>
              Click any location on the map to analyze crop condition
            </div>
          )}
        </div>
      </div>
    </div>
  );
}