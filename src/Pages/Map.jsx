import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "../App.css";
import LongLat from "../components/LongLat";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

import SwitchToSimulator from "../components/SwitchToSimulator";
import GeomanTools from "../components/GeomanTools";

// Fix issue default Leaflet marker not loading in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (mapRef.current) return;

    // 1️⃣ Create map
    const map = L.map(mapContainer.current, { zoomControl: false })
      .setView([-7.771337528683765, 110.3774982677273], 18);

    // IMPORTANT: set mapRef **SEBELUM** yang lain
    mapRef.current = map;

    // 2️⃣ Add zoom control
    L.control.zoom({
      position: "bottomright",
    }).addTo(mapRef.current);

    // 3️⃣ Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // 4️⃣ Remove Geoman default toolbar safely (tanpa ganggu mouse event)
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-pm-toolbar {
        display: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // 5️⃣ Initialize PM controls (disable all, because kamu pakai toolbar custom)
    map.pm.addControls({
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawPolygon: false,
      drawCircle: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      drawText: false,
    });

    // 6️⃣ Mouse move listener → update koordinat
    mapRef.current.whenReady(() => {
      mapRef.current.on("mousemove", (e) => {
        setCoords({
          lat: e.latlng.lat.toFixed(6),
          lng: e.latlng.lng.toFixed(6),
        });
      });
    });

    // 7️⃣ Force redraw after mount
    setTimeout(() => {
      map.invalidateSize();
      setReady(true);
    }, 150);

    const handleKey = (e) => {

      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
      document.activeElement.isContentEditable
      ) {
        return; // lagi ngetik → jangan trigger hotkey
      }

      if (e.key === "1") {
        document.getElementById("gm-marker")?.click();
      } else if (e.key === "2") {
        document.getElementById("gm-polyline")?.click();
      } else if (e.key === "3") {
        document.getElementById("gm-rectangle")?.click();
      } else if (e.key === "4") {
        document.getElementById("gm-polygon")?.click();
      } else if (e.key === "5") {
        document.getElementById("gm-circle")?.click();
      } else if (e.key === "6") {
        document.getElementById("gm-circlemarker")?.click();
      } else if (e.key === "7") {
        document.getElementById("gm-text")?.click();
      } else if (e.key === "8") {
        document.getElementById("gm-edit")?.click();
      } else if (e.key === "9") {
        document.getElementById("gm-drag")?.click();
      } else if (e.key === "Escape") {
        const map = mapRef.current;
        if (!map) return;

        map.pm.disableDraw();
        map.pm.disableGlobalEditMode();
        map.pm.disableGlobalDragMode();
        map.pm.disableGlobalRemovalMode();
      }
  };
    window.addEventListener("keydown", handleKey);

    // Cleanup
    return () => {

      window.removeEventListener("keydown", handleKey);

      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="switch-memory-sidebar">
          <SwitchToSimulator />
        </div>

        <LongLat coords={coords} />

        <div className="plan-menu">
          {ready && <GeomanTools map={mapRef.current} />}
        </div>
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;
