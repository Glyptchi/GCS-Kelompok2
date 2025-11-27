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
import SimulatorMissionList from "../components/SimulatorMissionList.jsx";
import LongLatSim from "../components/LongLat";

const Simulator = () => {
    const mapContainer = useRef(null); // Ref to the DOM element
    const mapInstance = useRef(null);  // Ref to store the map instance
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [ready, setReady] = useState(false);
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


    const [isRecording, setIsRecording] = useState(false);
    const recordedPath = useRef([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // refresh list kalau sudah save


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

        const style = document.createElement("style");
        style.innerHTML = `
          .leaflet-pm-toolbar {
            display: none !important;
            pointer-events: none !important;
          }
        `;
        document.head.appendChild(style);

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

        setTimeout(() => {
            mapInstance.current.invalidateSize();
            setReady(true);
        }, 150);

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

                if (isRecording) {
                    // Only add if position changed significantly? For now just add every frame or maybe throttle?
                    // Adding every frame might be too much data. Let's add.
                    // To optimize, we could check distance from last point.
                    const lastPoint = recordedPath.current[recordedPath.current.length - 1];
                    if (!lastPoint || (lastPoint[0] !== newPos.lat || lastPoint[1] !== newPos.lng)) {
                        recordedPath.current.push([newPos.lat, newPos.lng]);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

         return () => cancelAnimationFrame(animationFrameId);
    }, [isRecording]) // Re-run loop if isRecording changes? No, loop uses ref. But we need to make sure loop sees latest isRecording state.
    // Actually, isRecording is a state, so it will trigger re-render.
    // The loop function closes over the scope. If we don't include isRecording in dependency, loop might see stale value?
    // BUT, we are using requestAnimationFrame which calls loop recursively.
    // The loop function is defined INSIDE useEffect.
    // If we add isRecording to dependency, useEffect cleans up and restarts loop. This is fine.

    const handleToggleRecord = async () => {
        if (!isRecording) {
            // START RECORDING
            const confirmStart = confirm("Start recording new mission?");
            if (!confirmStart) return;

            recordedPath.current = [];
            setIsRecording(true);
            // Optional: Enable trail automatically when recording?
            // isTrail.current = true; 
        } else {
            // STOP RECORDING
            setIsRecording(false);

            if (recordedPath.current.length === 0) {
                alert("No path recorded.");
                return;
            }

            const name = prompt("Stop recording. Save mission as?");
            if (!name) return;

            // Create GeoJSON LineString
            const geojson = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "LineString",
                            coordinates: recordedPath.current.map(p => [p[1], p[0]]) // GeoJSON is [lng, lat]
                        }
                    }
                ]
            };

            try {
                await fetch("http://localhost:3000/missions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name,
                        data: [geojson.features[0]], // Geoman usually saves array of features, or we can save FeatureCollection. 
                        // Existing code expects array of features or similar. 
                        // Map.jsx: L.geoJSON(geojson) -> geojson can be FeatureCollection or array.
                        // GeomanTools saves: layers.map(l => l.toGeoJSON()) -> Array of Features.
                        // So let's save Array of Features.
                        type: "simulator"
                    })
                });

                alert("Mission saved!");
                setRefreshTrigger(prev => prev + 1); // Refresh list
            } catch (err) {
                console.error(err);
                alert("Error saving mission");
            }
        }
    };

    const loadMission = (mission) => {
        const map = mapInstance.current;
        if (!map) return;

        // Clear existing Geoman layers (avoid removing UAV marker or tiles)
        map.eachLayer(layer => {
            // Check if layer is not tile layer and not the UAV marker
            if (!layer._url && layer !== markerUAV.current && layer !== currentPolyline.current) {
                // Also check if it's not the trail polyline if we want to keep trails
                map.removeLayer(layer);
            }
        });

        const geojson = JSON.parse(mission.data);

        L.geoJSON(geojson, {
            onEachFeature: (feature, layer) => {
                layer.addTo(map);
            }
        });

        alert("Loaded mission: " + mission.name);
    };

return (
  <div className="app-layout">

    <div className="sidebar">

      <div className="switch-memory-sidebar">
                    <SwitchToPlanner />
                    {ready && (
                        <SimulatorMissionList onLoad={loadMission} refreshTrigger={refreshTrigger} />
                    )}
                </div>

      <LongLat coords={coords} />

      <div className="plan-menu">
                    <SidebarSim isRecording={isRecording} onToggleRecord={handleToggleRecord} />
                </div>

    </div>

    <div ref={mapContainer} className="map-container" />
  </div>
);

};

export default Simulator;