import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import map, {
  DEFAULT_CENTER, DEFAULT_ZOOM, simulatorMissionLG, simulatorTrailLG,
} from '../baseMap/leaflet';
import { getSimulatorMarker } from '../helpers/simulator';
import IconUAV from '../components/IconUAV';
import SidebarSim from '../components/SidebarSim';
import SimulatorMissionList from '../components/SimulatorMissionList';
import LongLatSim from '../components/LongLatSim';

export default function Simulator() {
  const [coords, setCoords] = useState(() => {
    const position = getSimulatorMarker().getLatLng();
    return { lat: position.lat.toFixed(6), lng: position.lng.toFixed(6) };
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const recordingRef = useRef(false);
  const recordedPath = useRef([]);
  const trailRef = useRef(null);

  const handleToggleRecord = useCallback(() => {
    const recording = !recordingRef.current;
    recordingRef.current = recording;
    setIsRecording(recording);
    if (recording) {
      const position = getSimulatorMarker().getLatLng();
      recordedPath.current = [[position.lat, position.lng]];
      setRecordingTime(0);
      setDistance(0);
      simulatorMissionLG.clearLayers();
      simulatorTrailLG.clearLayers();
      trailRef.current = L.polyline([[position.lat, position.lng]], {
        opacity: 0.7, pmIgnore: true,
      }).addTo(simulatorTrailLG);
    }
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setRecordingTime((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    const marker = getSimulatorMarker();
    const keys = new Set();
    let animationFrame;
    let lastTime = performance.now();
    let gamepadButtonPressed = false;
    const isTyping = (target) => target?.closest?.('input, textarea, select, [contenteditable="true"]');
    function onKeyDown(event) {
      if (isTyping(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      keys.add(key);
      if (key.startsWith('arrow')) event.preventDefault();
      if (key === '+' || key === '=') map.zoomIn();
      else if (key === '-' || key === '_') map.zoomOut();
      else if (key === '0') map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
    function onKeyUp(event) { keys.delete(event.key.toLowerCase()); }
    function onBlur() { keys.clear(); }

    function loop(now) {
      const frames = Math.min(now - lastTime, 50) / (1000 / 60);
      lastTime = now;
      let north = 0;
      let east = 0;
      if (!isTyping(document.activeElement)) {
        if (keys.has('w') || keys.has('arrowup')) north += 1;
        if (keys.has('s') || keys.has('arrowdown')) north -= 1;
        if (keys.has('d') || keys.has('arrowright')) east += 1;
        if (keys.has('a') || keys.has('arrowleft')) east -= 1;
        const gamepad = navigator.getGamepads?.()[0];
        if (gamepad) {
          const [axisX = 0, axisY = 0] = gamepad.axes;
          if (Math.abs(axisY) > 0.1) north -= axisY * 5;
          if (Math.abs(axisX) > 0.1) east += axisX * 5;
          const pressed = Boolean(gamepad.buttons[0]?.pressed);
          if (pressed && !gamepadButtonPressed) handleToggleRecord();
          gamepadButtonPressed = pressed;
        } else gamepadButtonPressed = false;
      }
      if (north !== 0 || east !== 0) {
        const previous = marker.getLatLng();
        const position = L.latLng(previous.lat + north * 0.000003 * frames,
          previous.lng + east * 0.000003 * frames);
        marker.setLatLng(position);
        marker.setIcon(IconUAV(Math.atan2(east, north) * 180 / Math.PI));
        map.panTo(position, { animate: false });
        setCoords({ lat: position.lat.toFixed(6), lng: position.lng.toFixed(6) });
        if (recordingRef.current) {
          setDistance((value) => value + previous.distanceTo(position));
          recordedPath.current.push([position.lat, position.lng]);
          trailRef.current?.addLatLng(position);
        }
      }
      animationFrame = requestAnimationFrame(loop);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    animationFrame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      recordingRef.current = false;
    };
  }, [handleToggleRecord]);

  async function handleSave() {
    if (recordedPath.current.length < 2) {
      alert('Rekam gerakan minimal dua titik terlebih dahulu.');
      return;
    }
    const name = prompt('Simpan simulasi? Masukkan nama:');
    if (!name) return;
    const feature = {
      type: 'Feature',
      properties: { duration: recordingTime, distance },
      geometry: {
        type: 'LineString',
        coordinates: recordedPath.current.map(([lat, lng]) => [lng, lat]),
      },
    };
    try {
      const base = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      const response = await fetch(`${base}/missions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: [feature], type: 'simulator' }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      alert('Simulasi tersimpan!');
      setRefreshTrigger((value) => value + 1);
    } catch (error) {
      console.error(error);
      alert('Error saat menyimpan simulasi');
    }
  }

  function loadMission(mission) {
    try {
      const geojson = typeof mission.data === 'string' ? JSON.parse(mission.data) : mission.data;
      const loaded = L.geoJSON(geojson, { pmIgnore: true });
      recordingRef.current = false;
      setIsRecording(false);
      recordedPath.current = [];
      simulatorMissionLG.clearLayers();
      simulatorTrailLG.clearLayers();
      trailRef.current = null;
      loaded.eachLayer((layer) => {
        layer.options.pmIgnore = true;
        simulatorMissionLG.addLayer(layer);
      });
      const features = Array.isArray(geojson) ? geojson : geojson.features || [geojson];
      const feature = features.find((item) => item.geometry?.type === 'LineString');
      setRecordingTime(feature?.properties?.duration ?? 0);
      setDistance(feature?.properties?.distance ?? 0);
      const points = feature?.geometry.coordinates;
      if (points?.length) {
        const [lng, lat] = points[points.length - 1];
        const marker = getSimulatorMarker();
        marker.setLatLng([lat, lng]);
        if (points.length >= 2) {
          const previous = points[points.length - 2];
          marker.setIcon(IconUAV(Math.atan2(lng - previous[0], lat - previous[1]) * 180 / Math.PI));
        }
        setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        map.panTo([lat, lng]);
      }
    } catch (error) {
      console.error(error);
      alert('Simulasi tidak dapat dimuat. Periksa format datanya.');
    }
  }

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="switch-memory-sidebar">
          <SimulatorMissionList onLoad={loadMission} refreshTrigger={refreshTrigger} />
        </div>
        <div className="plan-menu">
          <SidebarSim isRecording={isRecording} onToggleRecord={handleToggleRecord} onSave={handleSave} />
        </div>
      </div>
      <LongLatSim coords={coords} recordingTime={recordingTime} distance={distance}
        isRecording={isRecording} onResetView={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)} />
    </div>
  );
}
