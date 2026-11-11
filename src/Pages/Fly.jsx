import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import map, { DEFAULT_CENTER, flyModeLG } from '../baseMap/leaflet';
import IconUAV from '../components/IconUAV';

const display = (value, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : '—';

export default function Fly() {
  const plane = useSelector((state) => state.planeState);
  const backend = useSelector((state) => state.backendState);
  const [follow, setFollow] = useState(false);
  const marker = useRef(null);
  const positionLive = backend.isVehicleConnected && !backend.isTelemetryStale
    && backend.groupStale.position === false
    && Number.isFinite(plane.latitude) && Number.isFinite(plane.longitude)
    && Math.abs(plane.latitude) <= 90 && Math.abs(plane.longitude) <= 180;

  useEffect(() => {
    const vehicleMarker = L.marker(DEFAULT_CENTER, { icon: IconUAV(0), pmIgnore: true });
    marker.current = vehicleMarker;
    return () => {
      flyModeLG.removeLayer(vehicleMarker);
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    const vehicleMarker = marker.current;
    if (!vehicleMarker) return;
    if (!positionLive) {
      flyModeLG.removeLayer(vehicleMarker);
      return;
    }
    vehicleMarker.setLatLng([plane.latitude, plane.longitude]);
    vehicleMarker.setIcon(IconUAV(Number.isFinite(plane.heading) ? plane.heading : 0));
    flyModeLG.addLayer(vehicleMarker);
    if (follow) map.panTo([plane.latitude, plane.longitude], { animate: false });
  }, [plane.latitude, plane.longitude, plane.heading, positionLive, follow]);

  const live = (group) => backend.isVehicleConnected
    && !backend.isTelemetryStale && backend.groupStale[group] === false;
  const value = (group, number, digits = 1) => live(group) ? display(number, digits) : '—';

  return (
    <div className="app-layout">
      <aside className="sidebar fly-sidebar">
        <h2>Fly</h2>
        <p>Kendaraan {backend.vehicleId ?? '—'}</p>
        <dl className="telemetry-list">
          <dt>Backend</dt><dd>{backend.isBackendConnected ? 'Terhubung' : 'Terputus'}</dd>
          <dt>Redis</dt><dd>{backend.isRedisConnected ? 'Terhubung' : 'Terputus'}</dd>
          <dt>Telemetry</dt><dd>{backend.isVehicleConnected ? 'Terhubung' : 'Menunggu'}</dd>
          <dt>Arm</dt><dd>{live('heartbeat') ? (plane.armStatus ? 'Armed' : 'Disarmed') : '—'}</dd>
          <dt>Mode ID</dt><dd>{live('heartbeat') ? plane.mode : '—'}</dd>
          <dt>Heading</dt><dd>{value('attitude', plane.heading)}°</dd>
          <dt>Airspeed</dt><dd>{value('speed', plane.airspeed)} m/s</dd>
          <dt>Groundspeed</dt><dd>{value('speed', plane.gndspeed)} m/s</dd>
          <dt>Altitude relatif</dt><dd>{value('position', plane.altitude)} m</dd>
          <dt>Baterai</dt><dd>{value('battery', plane.battery, 0)}%</dd>
        </dl>
        <button className="fly-action" disabled={!positionLive}
          onClick={() => map.panTo([plane.latitude, plane.longitude])}>
          Pusatkan kendaraan
        </button>
        <label className="follow-control">
          <input type="checkbox" checked={follow} onChange={(event) => setFollow(event.target.checked)} />
          Ikuti kendaraan
        </label>
      </aside>
      <div className="card-wrapper">
        <div className="card1">
          <h4 className="status">Fly Status</h4>
          <div className="longlat-row"><span>Latitude</span><span>{value('position', plane.latitude, 6)}</span></div>
          <div className="longlat-row"><span>Longitude</span><span>{value('position', plane.longitude, 6)}</span></div>
          <p className="telemetry-note">{positionLive ? 'Posisi live' : 'Menunggu posisi terbaru'}</p>
        </div>
      </div>
    </div>
  );
}
