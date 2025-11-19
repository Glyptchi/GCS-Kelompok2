import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import '@geoman-io/leaflet-geoman-free';

const IconUAV = (heading) => {
    // ukuran ikon UAV
    const size = 25;

    return L.divIcon({
        className: 'drone-icon-container',
        html: `
      <div style="transform: rotate(${heading}deg); transform-origin: center; transition: transform 0.1s linear;">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#FF2A2A" stroke="#FF2A2A" stroke-width="2" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5)); display: block;">
           <path d="M12 2 L2 22 L12 18 L22 22 L12 2 Z" />
        </svg>
      </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

export default IconUAV