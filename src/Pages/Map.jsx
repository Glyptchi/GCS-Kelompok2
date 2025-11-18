import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import '../App.css';

import SwitchToSimulator from "../components/SwitchToSimulator";

import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';

const Map = () => {
    const mapContainer = useRef(null); // Ref to the DOM element
    const mapInstance = useRef(null);  // Ref to store the map instance

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapContainer.current).setView([-7.771337528683765, 110.3774982677273], 20);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        mapInstance.current.pm.addControls({
            position: 'topright',
            drawMarker: true,
            drawCircleMarker: true,
            drawPolyline: true,
            drawRectangle: true,
            drawPolygon: true,
            drawCircle: true,
            editMode: true,
            dragMode: true,
            cutPolygon: true,
            removalMode: true,
            drawText: true,
        });

        mapInstance.current.zoomControl.remove();

        const geomanControls = document.querySelector('.leaflet-pm-toolbar');

        if (geomanControls) {
        const sidebarTarget = document.querySelector('.plan-menu');

           sidebarTarget.appendChild(geomanControls);
        }
        

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
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
        </div>
      </div>

      <div ref={mapContainer} className="map-container" />
    </div>
    
  );

  
};

export default Map;