import L from 'leaflet';
import IconUAV from '../components/IconUAV';
import { DEFAULT_CENTER, simulatorLG } from '../baseMap/leaflet';

let marker;
export function getSimulatorMarker() {
  marker ??= L.marker(DEFAULT_CENTER, { icon: IconUAV(0), pmIgnore: true })
    .addTo(simulatorLG);
  return marker;
}
