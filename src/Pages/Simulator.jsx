import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import '../App.css';

import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import '@geoman-io/leaflet-geoman-free';

const Map = () => {
    const mapContainer = useRef(null); // Ref to the DOM element
    const mapInstance = useRef(null);  // Ref to store the map instance

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        mapInstance.current.pm.addControls({
            position: 'topright',
            oneBlock: true,
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

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{ height: '100%', width: '100%' }}
        />


    );
};

export default Map;