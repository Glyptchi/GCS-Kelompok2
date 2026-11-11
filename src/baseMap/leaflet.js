import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export const DEFAULT_CENTER = [-7.771337528683765, 110.3774982677273];
export const DEFAULT_ZOOM = 17;

// URL asset dari Vite sudah lengkap; jangan tambahkan hasil deteksi path CSS.
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow,
});

// Container berada di index.html, sehingga tidak ikut unmount saat pindah route.
// Tetapkan sebelum L.map agar Leaflet tidak memasang inline position: relative
// ketika stylesheet aplikasi belum selesai dimuat.
document.getElementById('map').style.position = 'fixed';
const map = L.map('map', { zoomControl: false, keyboard: false })
  .setView(DEFAULT_CENTER, DEFAULT_ZOOM);
L.control.zoom({ position: 'bottomright' }).addTo(map);

const basemaps = {
  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', maxZoom: 18 },
  ),
};
let activeBasemap = null;
function setBasemap(name) {
  const next = basemaps[name];
  if (!next || next === activeBasemap) return;
  activeBasemap?.removeFrom(map);
  next.addTo(map);
  activeBasemap = next;
}
setBasemap('satellite');

const planModeLG = L.featureGroup();
const flyModeLG = L.featureGroup([], { pmIgnore: true });
const simulatorLG = L.featureGroup([], { pmIgnore: true });
const simulatorMissionLG = L.featureGroup([], { pmIgnore: true }).addTo(simulatorLG);
const simulatorTrailLG = L.featureGroup([], { pmIgnore: true }).addTo(simulatorLG);

map.pm.setGlobalOptions({ layerGroup: planModeLG });
map.on('pm:remove', ({ layer }) => planModeLG.removeLayer(layer));

function disableMapTools() {
  map.pm.disableDraw();
  map.pm.disableGlobalEditMode();
  map.pm.disableGlobalDragMode();
  map.pm.disableGlobalRemovalMode();
  map.pm.disableGlobalCutMode();
  map.pm.disableGlobalRotateMode();
}

function setMapMode(mode) {
  disableMapTools();
  for (const [name, group] of Object.entries({ plan: planModeLG, fly: flyModeLG, simulator: simulatorLG })) {
    if (name === mode) group.addTo(map);
    else map.removeLayer(group);
  }
  map.invalidateSize({ pan: false });
}

const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
observer.observe(map.getContainer());

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    observer.disconnect();
    map.remove();
  });
}

export default map;
export {
  basemaps, setBasemap, setMapMode, disableMapTools,
  planModeLG, flyModeLG, simulatorLG, simulatorMissionLG, simulatorTrailLG,
};
