import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "../App.css";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

import SwitchToSimulator from "../components/SwitchToSimulator";
import GeomanTools from "../components/GeomanTools";

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);   // ← PENTING: map disimpan di ref, bukan state
  const [ready, setReady] = useState(false); // untuk render tools setelah map fix

  useEffect(() => {
    if (mapRef.current) return; // jangan buat 2x

    // 1. Buat map
    const map = L.map(mapContainer.current, {
      zoomControl: false,
    }).setView([-7.771337528683765, 110.3774982677273], 20);

    mapRef.current = map;

    // 2. Basemap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // 3. Disable semua toolbar geoman
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

    // remove leftover DOM
    const toolbar = document.querySelector(".leaflet-pm-toolbar");
    if (toolbar) toolbar.remove();

    // 4. Baru izinkan render toolbar custom
    setReady(true);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="app-layout">
      <div className="sidebar">

        {/* WHITE SIDEBAR */}
        <div className="switch-memory-sidebar">
          <SwitchToSimulator />
        </div>

        {/* BLUE SIDEBAR */}
        <div className="plan-menu">
          {ready && <GeomanTools map={mapRef.current} />}
        </div>
      </div>

      {/* MAP */}
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;
