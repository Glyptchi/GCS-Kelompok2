import {
  setBackendConnection, setRedisConnection, updateVehicleConnection,
} from './reducers/backendStateSlice.js';
import { updatePlaneState, resetPlaneState } from './reducers/planeStateSlice.js';

// Adapter payload backend bertingkat ke field planeState seperti Adhyasta.
export function toPlaneState(vehicle) {
  const state = {};
  if (vehicle.heartbeat) {
    const heartbeat = vehicle.heartbeat;
    Object.assign(state, {
      vehicleType: heartbeat.vehicleType, autopilot: heartbeat.autopilot,
      mode: heartbeat.customMode, armStatus: heartbeat.armed,
    });
  }
  if (vehicle.attitude) {
    const { heading, pitch, roll } = vehicle.attitude;
    Object.assign(state, { heading, pitch, roll });
  }
  if (vehicle.position) {
    const { latitude, longitude, relativeAltitude, altitudeMsl } = vehicle.position;
    Object.assign(state, { latitude, longitude, altitude: relativeAltitude, altitudeMsl });
  }
  if (vehicle.speed) {
    const { airspeed, groundspeed, climb } = vehicle.speed;
    Object.assign(state, { airspeed, gndspeed: groundspeed, climbRate: climb });
  }
  if (vehicle.battery) state.battery = vehicle.battery.remaining;
  if (vehicle.gps) {
    const { fixType, satellites, hdop, vdop } = vehicle.gps;
    Object.assign(state, { gpsFixType: fixType, satelliteCount: satellites, hdop, vdop });
  }
  return state;
}

export default function initializeFromBackend(store, socket) {
  // planeState menyimpan satu kendaraan seperti Adhyasta. Jangan campur system ID.
  let activeVehicleId = null;
  const groups = ['heartbeat', 'position', 'attitude', 'speed', 'battery', 'gps', 'statusText'];

  function syncVehicleStatus(vehicle) {
    store.dispatch(updateVehicleConnection({
      vehicleId: vehicle?.vehicleId ?? null,
      connected: Boolean(vehicle?.connected),
      stale: vehicle?.stale ?? true,
      groupStale: Object.fromEntries(groups.map((key) => [key, vehicle?.[key]?.stale ?? true])),
    }));
  }

  function onUpdate(vehicle) {
    if (!vehicle || !Number.isInteger(vehicle.vehicleId)) return;
    activeVehicleId ??= vehicle.vehicleId;
    if (vehicle.vehicleId !== activeVehicleId) return;
    store.dispatch(updatePlaneState(toPlaneState(vehicle)));
    syncVehicleStatus(vehicle);
  }

  function onSnapshot(vehicles) {
    store.dispatch(resetPlaneState());
    const selected = vehicles.find((vehicle) => vehicle.vehicleId === activeVehicleId) || vehicles[0];
    activeVehicleId = selected?.vehicleId ?? null;
    if (selected) onUpdate(selected);
    else syncVehicleStatus(null);
  }

  function onConnect() {
    store.dispatch(setBackendConnection(true));
  }

  function onDisconnect() {
    store.dispatch(setBackendConnection(false));
  }

  function onConnectError(error) {
    onDisconnect();
    console.error('Koneksi backend gagal:', error.message);
  }

  function onStatus({ redisConnected }) {
    store.dispatch(setRedisConnection(redisConnected));
  }

  const handlers = {
    connect: onConnect,
    disconnect: onDisconnect,
    connect_error: onConnectError,
    'telemetry:snapshot': onSnapshot,
    'telemetry:update': onUpdate,
    'telemetry:status': onStatus,
  };
  for (const [event, handler] of Object.entries(handlers)) socket.on(event, handler);
  return () => {
    for (const [event, handler] of Object.entries(handlers)) socket.off(event, handler);
  };
}
