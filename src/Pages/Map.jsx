/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "../App.css";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";

import LongLat from "../components/LongLat";
import SwitchToSimulator from "../components/SwitchToSimulator";
import GeomanTools from "../components/GeomanTools";
import MissionList from "../components/MissionList.jsx";

export const mapRef = { current: null };

const Map = () => {
  const mapContainer = useRef(null);

  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {

    if (mapRef.current) return;

    // 1 Create map
    const map = L.map(mapContainer.current, { zoomControl: false })
      .setView([-7.771337528683765, 110.3774982677273], 17);

    // set mapRef sebelum yang lain
    mapRef.current = map;

    // Add zoom control
    L.control.zoom({
      position: "bottomright",
    }).addTo(mapRef.current);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);

    // 4 Remove Geoman default toolbar safely (tanpa ganggu mouse event)
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-pm-toolbar {
        display: none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // 5 Initialize PM controls (disable all, because kamu pakai toolbar custom)
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

    // 6 Mouse move listener → update koordinat
    mapRef.current.whenReady(() => {
      mapRef.current.on("mousemove", (e) => {
        setCoords({
          lat: e.latlng.lat.toFixed(6),
          lng: e.latlng.lng.toFixed(6),
        });
      });
    });

    //Force redraw after mount
    setTimeout(() => {
      map.invalidateSize();
      setReady(true);
    }, 150);

    const undo = () => {
      const layers = map.pm.getGeomanLayers();
      const last = layers[layers.length - 1];
      if (last) last.remove();
    };

    {/*Keyboarding*/ }
    const handleKey = (e) => {

      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable
      ) return;

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
      } else if (e.key === "T" || e.key === "t") {
        document.getElementById("gm-text")?.click();
      } else if (e.key === "E" || e.key === "e") {
        document.getElementById("gm-edit")?.click();
      } else if (e.key === "M" || e.key === "m") {
        document.getElementById("gm-drag")?.click();
      } else if (e.key === "Escape") {

        const map = mapRef.current;
        if (!map) return;
        map.pm.disableDraw();
        map.pm.disableGlobalEditMode();
        map.pm.disableGlobalDragMode();
        map.pm.disableGlobalRemovalMode();

      } else if (e.key === "0" || e.key === ")") {
        const map = mapRef.current;
        if (!map) return;
        map.setView([-7.771337528683765, 110.3774982677273], 17);
      } else if (e.key === "+" || e.key === "=") {
        map.zoomIn();
      } else if (e.key === "-" || e.key === "_") {
        map.zoomOut();
      } else if (e.key === "C" || e.key === "c") {
        document.getElementById("gm-cut")?.click();
      } else if (e.key === "R" || e.key === "r") {
        document.getElementById("gm-rotate")?.click();
      } else if (e.key === "D" || e.key === "d") {
        document.getElementById("gm-remove")?.click();
      } else if ((e.key === "Z" || e.key === "z") && (e.ctrlKey || e.metaKey)) {
        undo();
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

  const loadMission = (mission) => {
    const map = mapRef.current;

    // clear semua layer kecuali tile
    map.eachLayer(layer => {
      if (!layer._url) layer.remove();
    });

    const geojson = typeof mission.data === "string"
      ? JSON.parse(mission.data)
      : mission.data;

    L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        if (feature.properties && feature.properties.layerType === "Circle") {
          return L.circle(latlng, { radius: feature.properties.radius });
        } else if (feature.properties && feature.properties.layerType === "CircleMarker") {
          return L.circleMarker(latlng, { radius: feature.properties.radius });
        }
        return L.marker(latlng);
      },
      onEachFeature: (feature, layer) => {
        layer.addTo(map);
      }
    });

    alert("Loaded mission: " + mission.name);
  };


  const [editingMission, setEditingMission] = useState(null);

  const handleEdit = (mission) => {
    loadMission(mission);
    setEditingMission(mission);
    // Optional: Enable edit mode automatically
    // if (mapRef.current && mapRef.current.pm) {
    //   mapRef.current.pm.enableGlobalEditMode();
    // }
  };

  const handleUpdate = () => {
    setEditingMission(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="switch-memory-sidebar">
          <SwitchToSimulator />
          {ready && (
            <MissionList
              onLoad={loadMission}
              onEdit={handleEdit}
              refreshTrigger={refreshTrigger}
            />
          )}

        </div>
        <LongLat coords={coords} />
        <div className="plan-menu">
          {ready && (
            <>
              <GeomanTools
                map={mapRef.current}
                type="plan"
                onSaved={handleSaved}
                editingId={editingMission?.id}
                editingName={editingMission?.name}
                onUpdate={handleUpdate}
              />
            </>
          )}
        </div>

      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;
