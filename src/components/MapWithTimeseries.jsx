import React, { useState, useEffect, useRef } from "react";
import { TopPanel } from "./TopPanel";
import { MapSection } from "./MapSection";
import { ChartModal } from "./ChartModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function MapWithTimeseries() {
  /* =======================
     1. STATES
  ======================= */

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

  /* =======================
     2. EFFECTS
  ======================= */

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
    if (e.target.closest(".drag-handle")) {
      setIsDragging(true);
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
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
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  /* =======================
     3. API FUNCTIONS
  ======================= */

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
      (data.data.reduce((s, d) => s + d[key], 0) / data.data.length).toFixed(
        4
      );

    setStats({
      avg_ndvi: avg("NDVI"),
      avg_ndwi: avg("NDWI"),
      avg_nsmi: avg("NSMI"),
    });
  };

  /* =======================
     4. MODAL HANDLERS
  ======================= */

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
        top: `${customPopupPos.y}px`,
      };
    }

    if (popupPosition) {
      const leftPosition =
        popupPosition.x > window.innerWidth / 2
          ? popupPosition.x - 560
          : popupPosition.x + 80;
      const topPosition = Math.max(
        40,
        Math.min(popupPosition.y - 180, window.innerHeight - 400)
      );

      return {
        left: `${leftPosition}px`,
        top: `${topPosition}px`,
      };
    }

    return {};
  };

  /* =======================
     5. RENDER
  ======================= */

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

      {/* Fixed Top Control Panel */}
      <TopPanel
        form={form}
        setForm={setForm}
        indexType={indexType}
        setIndexType={setIndexType}
        fetchComposite={fetchComposite}
        downloadUrl={downloadUrl}
      />

      {/* Map Container with Padding */}
      <MapSection
        tileUrl={tileUrl}
        selectedPoint={selectedPoint}
        fetchTimeseries={fetchTimeseries}
        setMapInstance={setMapInstance}
        showModal={showModal}
        isFullscreen={isFullscreen}
        popupPosition={popupPosition}
        popupRef={popupRef}
        isDragging={isDragging}
        handleMouseDown={handleMouseDown}
        customPopupPos={customPopupPos}
        getPopupStyle={getPopupStyle}
        closeModal={closeModal}
        toggleFullscreen={toggleFullscreen}
        timeseries={timeseries}
        stats={stats}
      />

      {/* Chart Modal - Fullscreen Only */}
      <ChartModal
        showModal={showModal}
        isFullscreen={isFullscreen}
        selectedPoint={selectedPoint}
        timeseries={timeseries}
        stats={stats}
        toggleFullscreen={toggleFullscreen}
        closeModal={closeModal}
      />
    </div>
  );
}