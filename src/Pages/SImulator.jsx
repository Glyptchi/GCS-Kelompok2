import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../App.css';
import IconUAV from "../components/IconUAV.jsx";
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';
import {polyline} from "leaflet/src/layer/index.js";
import LongLat from "../components/LongLat.jsx";
import SidebarSim from "../components/SidebarSim.jsx";  // 
import SwitchToPlanner from "../components/SwitchToPlanner.jsx";


const Simulator = () => {
    const mapContainer = useRef(null); // Ref to the DOM element
    const mapInstance = useRef(null);  // Ref to store the map instance
    const [coords, setCoords] = useState({ lat: null, lng: null });
    // const untuk UAV
    const markerUAV = useRef(null);
    const keysPressed = useRef({});
    const speedUAV = 0.00015;
    const currentPolyline = useRef(null);
    const isTrail = useRef(false);
    // const untuk gamepad
    const gamepadMultiplier = 3.0; // variasi speed dari gamepad
    const gamepadDeadzone = 0.1; //untuk menghindari jitter
    const gamepadButton = useRef(false);

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapContainer.current, {zoomControl: false}).setView([-7.771337528683765, 110.3774982677273], 17);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(mapInstance.current);

        markerUAV.current = L.marker([-7.771337528683765, 110.3774982677273],{
            icon: IconUAV(0),
            pmIgnore: true // biar di ignore move tool dari geoman
        }).addTo(mapInstance.current);


        mapInstance.current.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawPolygon: false,
            drawCircle: false,
            editMode: false,
            dragMode: false,
            cutPolygon: false,
            removalMode: false,
            drawText: false,
            rotateLayers: false,
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.off();
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // handle untuk Cek key apa yang dipencet
    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.key] = true;

            // kode untuk memberi trail
            if (e.code === 'Space') {
                isTrail.current = !isTrail.current;

                if (!isTrail.current) {
                    currentPolyline.current = null;
                }
            } else if (e.key === '+' || e.key === '=') {
                mapInstance.current?.zoomIn();
            } else if (e.key === '-' || e.key === '_') {
                mapInstance.current?.zoomOut();
            } else if (e.key === '0') {
                mapInstance.current?.setView([-7.771337528683765, 110.3774982677273], 17);
            }
        };

        const handleKeyUp = (e) => {
            keysPressed.current[e.key] = false;
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, [])

    useEffect(() => {
        let animationFrameId;

        const loop = () => {
            let moveLatitude = 0;
            let moveLongitude = 0;

            // kontrol standar WASD (masih perlu pembetulan rumus)
            if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) moveLatitude += speedUAV
            if (keysPressed.current['s'] || keysPressed.current['ArrowDown']) moveLatitude -= speedUAV
            if (keysPressed.current['d'] || keysPressed.current['ArrowRight']) moveLongitude += speedUAV
            if (keysPressed.current['a'] || keysPressed.current['ArrowLeft']) moveLongitude -= speedUAV

            const gamepad = navigator.getGamepads(); // modul gamepad
            const gp = gamepad[0]; //ambil joystick pertama / kiri

            if (gp) {
                const axisX = gp.axes[0];
                const axisY = gp.axes[1];

                if (Math.abs(axisY) > gamepadDeadzone) {
                    moveLatitude -= axisY * speedUAV * gamepadMultiplier;
                }

                if (Math.abs(axisX) > gamepadDeadzone) {
                    moveLongitude += axisX * speedUAV * gamepadMultiplier;
                }

                const isBtnPressed = gp.buttons[0].pressed;

                if (isBtnPressed && !gamepadButton.current) {
                    isTrail.current = !isTrail.current;
                    if (!isTrail.current) currentPolyline.current = null;
                }
                gamepadButton.current = isBtnPressed;
            }

            if (moveLatitude !== 0 || moveLongitude !== 0) {
                const currentPos = markerUAV.current.getLatLng(moveLatitude, moveLongitude);
                const newPos = {
                    lat: currentPos.lat + moveLatitude,
                    lng: currentPos.lng + moveLongitude
                };

                // kalkulasi rotasi (rumus standar dari GameDev)
                const headingRad = Math.atan2(moveLongitude, moveLatitude);
                const headingDeg = headingRad * (180 / Math.PI);

                // Untuk perintah menggerakan IconUAV
                markerUAV.current.setLatLng(newPos);

                setCoords({
                    lat: newPos.lat.toFixed(6),
                    lng: newPos.lng.toFixed(6),
                });

                // update IconUav berdasarkan Rotasi sekarang
                markerUAV.current.setIcon(IconUAV(headingDeg));

                // Pan kamera / window untuk mengikuti IconUAV
                mapInstance.current.panTo(newPos, { animate: false });

                // handle untuk trail UAV saat simulasi menggunakan polyline leaflet
                if (isTrail.current) {
                    if (!currentPolyline.current) {
                        currentPolyline.current = L.polyline([], {
                            opacity: 0.7,
                        }).addTo(mapInstance.current);
                    }
                    currentPolyline.current.addLatLng(newPos);
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => cancelAnimationFrame(animationFrameId);
    },[])

return (
  <div className="app-layout">

    <div className="sidebar">

      <div className="switch-memory-sidebar">
        <SwitchToPlanner />
      </div>

      <LongLat coords={coords} />

      <div className="plan-menu">
        <SidebarSim />
      </div>

    </div>

    <div ref={mapContainer} className="map-container" />
  </div>
);

};

export default Simulator;