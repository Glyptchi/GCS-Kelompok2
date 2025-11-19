import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "../App.css";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

import SwitchToSimulator from "../components/SwitchToSimulator";
import GeomanTools from "../components/GeomanTools";

// Fix Leaflet default icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map(mapContainer.current, {
      zoomControl: false,
    }).setView([-7.771337528683765, 110.3774982677273], 20);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

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

    const toolbar = document.querySelector(".leaflet-pm-toolbar");
    if (toolbar) toolbar.remove();

    setTimeout(() => {
      map.invalidateSize();
      setReady(true);
    }, 100);

    return () => {
      if (mapRef.current) {
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

        <div className="plan-menu">
          {ready && <GeomanTools map={mapRef.current} />}
        </div>
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;