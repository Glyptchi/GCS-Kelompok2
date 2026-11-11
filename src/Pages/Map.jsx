import { useEffect, useState } from 'react';
import L from 'leaflet';
import map, { DEFAULT_CENTER, DEFAULT_ZOOM, planModeLG, disableMapTools } from '../baseMap/leaflet';
import LongLat from '../components/LongLat';
import GeomanTools from '../components/GeomanTools';
import MissionList from '../components/MissionList';

export default function MapPage() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingMission, setEditingMission] = useState(null);

  useEffect(() => {
    function onMouseMove(event) {
      setCoords({ lat: event.latlng.lat.toFixed(6), lng: event.latlng.lng.toFixed(6) });
    }
    function onKeyDown(event) {
      if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      const shortcuts = {
        '1': 'gm-marker', '2': 'gm-polyline', '3': 'gm-rectangle',
        '4': 'gm-polygon', '5': 'gm-circle', '6': 'gm-circlemarker',
        t: 'gm-text', e: 'gm-edit', m: 'gm-drag', c: 'gm-cut', r: 'gm-rotate', d: 'gm-remove',
      };
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'z') {
        event.preventDefault();
        const layers = planModeLG.getLayers();
        if (layers.length) planModeLG.removeLayer(layers[layers.length - 1]);
      } else if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      } else if (key === 'escape') {
        disableMapTools();
      } else if (key === '0' || key === ')') {
        map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      } else if (key === '+' || key === '=') {
        map.zoomIn();
      } else if (key === '-' || key === '_') {
        map.zoomOut();
      } else if (shortcuts[key]) {
        document.getElementById(shortcuts[key])?.click();
      }
    }
    map.on('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      map.off('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      disableMapTools();
    };
  }, []);

  function loadMission(mission) {
    try {
      const geojson = typeof mission.data === 'string' ? JSON.parse(mission.data) : mission.data;
      // Parse sebelum mengganti mission yang sudah ada.
      const loaded = L.geoJSON(geojson, {
        pointToLayer(feature, latlng) {
          if (feature.properties?.layerType === 'Circle') {
            return L.circle(latlng, { radius: feature.properties.radius });
          }
          if (feature.properties?.layerType === 'CircleMarker') {
            return L.circleMarker(latlng, { radius: feature.properties.radius });
          }
          return L.marker(latlng);
        },
      });
      disableMapTools();
      planModeLG.clearLayers();
      loaded.eachLayer((layer) => planModeLG.addLayer(layer));
      setEditingMission(null);
    } catch (error) {
      console.error(error);
      alert('Mission tidak dapat dimuat. Periksa format datanya.');
    }
  }

  function handleEdit(mission) {
    loadMission(mission);
    setEditingMission(mission);
  }

  function handleSaved() {
    setEditingMission(null);
    setRefreshTrigger((previous) => previous + 1);
  }

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="switch-memory-sidebar">
          <MissionList onLoad={loadMission} onEdit={handleEdit} refreshTrigger={refreshTrigger} />
        </div>
        <div className="plan-menu">
          <GeomanTools
            onSaved={handleSaved}
            editingId={editingMission?.id}
            editingName={editingMission?.name}
            onUpdate={handleSaved}
          />
        </div>
      </div>
      <LongLat coords={coords} onResetView={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)} />
    </div>
  );
}
