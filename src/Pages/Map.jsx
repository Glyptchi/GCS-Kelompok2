import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../App.css';
import '../Pages/Map.css'
import LongLat from '../Components/LongLat';

import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import '@geoman-io/leaflet-geoman-free';

const Map = () => {
    const mapContainer = useRef(null);
    const mapInstance = useRef(null);

    const [coords, setCoords] = useState({ lat: null, lng: null });

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapContainer.current, {zoomControl: false}).setView([-7.769912033980343, 110.37818386065933], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(mapInstance.current);

        mapInstance.current.pm.addControls({
            position: 'topleft'
        });

        mapInstance.current.whenReady(() => {
            mapInstance.current.on("mousemove", (e) => {
                setCoords({
                    lat: e.latlng.lat.toFixed(6),
                    lng: e.latlng.lng.toFixed(6),
                });
            });
        });
        mapInstance.current.pm.addControls({
            position: 'topleft',
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
                mapInstance.current.off();
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <>
            <div className='map-container'
                 ref={mapContainer}
            />
            <div>
                <LongLat coords={coords}/>
            </div>

        </>
    );
};

export default Map;