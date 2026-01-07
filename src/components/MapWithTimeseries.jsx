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

const BACKEND_URL = "http://localhost:5000";

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
        borderColor: "green",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "NDWI",
        data: timeseries.map((d) => d.NDWI),
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "NSMI",
        data: timeseries.map((d) => d.NSMI),
        borderColor: "orange",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", height: "100vh", padding: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2>Satellite Indices Viewer 🌍</h2>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <input type="number" min="0" max="100" value={form.max_cloud} onChange={(e) => setForm({ ...form, max_cloud: e.target.value })} />
          <select value={indexType} onChange={(e) => setIndexType(e.target.value)}>
            <option value="NDVI">NDVI</option>
            <option value="NDWI">NDWI</option>
            <option value="NSMI">NSMI</option>
            <option value="TRUE_COLOR">True Color</option>
          </select>
          <button onClick={fetchComposite}>Load Composite</button>
        </div>

        <div style={{ flex: 1, border: "1px solid #aaa", borderRadius: "6px", overflow: "hidden" }}>
          <MapContainer center={[17.0, 81.8]} zoom={11} style={{ height: "100%", width: "100%" }}>
            
            {/* Base satellite layer */}
            <TileLayer
              attribution="&copy; Esri — Imagery"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            {/* Overlay Sentinel Index Composite */}
            {tileUrl && <TileLayer url={tileUrl} opacity={0.7} />}

            {/* The marker icon is now visible 100% ✔ */}
            {selectedPoint && <Marker position={[selectedPoint.lat, selectedPoint.lng]} />}

            {/* Map click event */}
            <ClickHandler onClick={(latlng) => fetchTimeseries(latlng)} />
          </MapContainer>
        </div>

        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noreferrer">
            Download Cloud-Masked {indexType} GeoTIFF
          </a>
        )}
      </div>

      {/* Time Series Chart */}
      <div>
        <h3>Time-Series Analytics 📈</h3>
        {selectedPoint && <p>📍 {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}</p>}
        {stats && (
          <div>
            <p>Avg NDVI: {stats.avg_ndvi}</p>
            <p>Avg NDWI: {stats.avg_ndwi}</p>
            <p>Avg NSMI: {stats.avg_nsmi}</p>
          </div>
        )}
        {timeseries.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p>Click any location on the map to analyze crop condition</p>
        )}
      </div>
    </div>
  );
}
