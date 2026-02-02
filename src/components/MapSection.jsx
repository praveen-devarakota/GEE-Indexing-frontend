import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Proper marker icon fix for Vite + Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

export function MapSection({
  tileUrl,
  selectedPoint,
  fetchTimeseries,
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "10px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        <MapContainer
          center={[17.0, 81.8]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; Esri — Imagery"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {tileUrl && <TileLayer url={tileUrl} opacity={0.7} />}
          {selectedPoint && (
            <Marker position={[selectedPoint.lat, selectedPoint.lng]} />
          )}
          <ClickHandler onClick={(latlng) => fetchTimeseries(latlng)} />
        </MapContainer>
      </div>
    </div>
  );
}