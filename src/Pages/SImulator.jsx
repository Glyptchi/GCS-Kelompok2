import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../App.css';
import IconUAV from "../components/IconUAV.jsx";
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';
import { polyline } from "leaflet/src/layer/index.js";
import SidebarSim from "../components/SidebarSim.jsx";  // 
import SwitchToPlanner from "../components/SwitchToPlanner.jsx";
import SimulatorMissionList from "../components/SimulatorMissionList.jsx";
import LongLatSim from "../components/LongLatSim.jsx";

const Simulator = () => {
    const mapContainer = useRef(null); // Ref to the DOM element
    const mapInstance = useRef(null);  // Ref to store the map instance
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [ready, setReady] = useState(false);
    // const untuk UAV
    const markerUAV = useRef(null);
    const keysPressed = useRef({});
    // Adjusted speed: 20 m/s approx.
    // 1 deg ~ 111,000 m. 20m = 0.00018 deg.
    // 60 fps -> 0.00018 / 60 = 0.000003
    const speedUAV = 0.000003;
    const currentPolyline = useRef(null);
    const isTrail = useRef(false);
    // const untuk gamepad
    const gamepadMultiplier = 5.0; // variasi speed dari gamepad (boost)
    const gamepadDeadzone = 0.1; //untuk menghindari jitter
    const gamepadButton = useRef(false);


    const [isRecording, setIsRecording] = useState(false);
    const recordedPath = useRef([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // refresh list kalau sudah save

    // Stats
    const [recordingTime, setRecordingTime] = useState(0);
    const [distance, setDistance] = useState(0);
    const timerRef = useRef(null);


    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapContainer.current, { zoomControl: false }).setView([-7.771337528683765, 110.3774982677273], 17);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18
            }).addTo(mapInstance.current);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(mapInstance.current);

        markerUAV.current = L.marker([-7.771337528683765, 110.3774982677273], {
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

            if (e.key === '+' || e.key === '=') {
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

    // Timer for recording
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // Need a ref to access handleToggleRecord inside the loop closure without stale closures issues
    // Or just use a flag in ref to trigger it?
    // Since handleToggleRecord changes state, calling it from loop (animation frame) is tricky if it depends on state.
    // But handleToggleRecord uses isRecording state.
    // The loop runs continuously. We can check gamepad button.
    // If button pressed, we want to toggle.
    // We can use a ref to store the "request to toggle" and a useEffect to react to it?
    // Or just use a ref for isRecording in the loop?
    // Actually, we can just call a function that checks the ref.
    // Let's make isRecordingRef to track state inside loop.
    const isRecordingRef = useRef(false);
    useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

    // We need to trigger the toggle function from the loop. 
    // Since the loop is inside useEffect, it captures the initial handleToggleRecord.
    // We can put handleToggleRecord in a ref.
    const toggleRecordRef = useRef(null);

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
                    // Button 0 pressed (Cross/A) -> Toggle Recording
                    if (toggleRecordRef.current) {
                        toggleRecordRef.current();
                    }
                }
                gamepadButton.current = isBtnPressed;
            }

            if (moveLatitude !== 0 || moveLongitude !== 0) {
                const currentPos = markerUAV.current.getLatLng();
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

                if (isRecordingRef.current) {
                    const lastPoint = recordedPath.current[recordedPath.current.length - 1];
                    // Calculate distance
                    if (lastPoint) {
                        const dist = L.latLng(lastPoint[0], lastPoint[1]).distanceTo(L.latLng(newPos.lat, newPos.lng));
                        setDistance(prev => prev + dist);
                    }

                    if (!lastPoint || (lastPoint[0] !== newPos.lat || lastPoint[1] !== newPos.lng)) {
                        recordedPath.current.push([newPos.lat, newPos.lng]);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const handleToggleRecord = async () => {
        if (!isRecording) {
            // START RECORDING
            recordedPath.current = [];
            setRecordingTime(0);
            setDistance(0);
            setIsRecording(true);

            // Auto marker / trail
            isTrail.current = true;
            // Reset polyline ketika record
            if (currentPolyline.current) {
                currentPolyline.current.remove();
                currentPolyline.current = null;
            }

            // clear map dari load simulasi
            if (mapInstance.current) {
                mapInstance.current.eachLayer(layer => {
                    if (!layer._url && layer !== markerUAV.current && layer !== currentPolyline.current) {
                        mapInstance.current.removeLayer(layer);
                    }
                });
            }

        } else {
            // STOP RECORDING
            setIsRecording(false);
            isTrail.current = false;
        }
    };

    const handleSave = async () => {
        if (recordedPath.current.length === 0) {
            alert("Tidak ada gerakan yang tersimpan!");
            return;
        }

        const name = prompt("Simpan simulasi? Masukkan nama:");
        if (!name) return;

        // Buat GeoJSON LineString
        const geojson = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {
                        duration: recordingTime,
                        distance: distance
                    },
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
                    data: [geojson.features[0]],
                    type: "simulator"
                })
            });

            alert("Simulasi tersimpan!");
            setRefreshTrigger(prev => prev + 1); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Error saat menyimpan simulasi");
        }
    };

    useEffect(() => {
        toggleRecordRef.current = handleToggleRecord;
    }, [isRecording, recordingTime, distance]);

    const loadMission = (mission) => {
        const map = mapInstance.current;
        if (!map) return;

        map.eachLayer(layer => {
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

        // Pindah UAV ke titik terakhir
        const features = Array.isArray(geojson) ? geojson : (geojson.features || [geojson]);
        if (features.length > 0) {
            const lastFeature = features[0];

            // Load status meter dan waktu
            if (lastFeature.properties) {
                if (lastFeature.properties.duration !== undefined) {
                    setRecordingTime(lastFeature.properties.duration);
                }
                if (lastFeature.properties.distance !== undefined) {
                    setDistance(lastFeature.properties.distance);
                }
            }

            if (lastFeature.geometry.type === "LineString") {
                const coords = lastFeature.geometry.coordinates;
                if (coords.length > 0) {
                    const lastPoint = coords[coords.length - 1]; // [lng, lat]
                    const newPos = { lat: lastPoint[1], lng: lastPoint[0] };

                    markerUAV.current.setLatLng(newPos);
                    setCoords({
                        lat: newPos.lat.toFixed(6),
                        lng: newPos.lng.toFixed(6)
                    });
                    map.panTo(newPos);

                    // kembalikakan rotasi uav
                    if (coords.length >= 2) {
                        const prevPoint = coords[coords.length - 2];
                        const dLng = lastPoint[0] - prevPoint[0];
                        const dLat = lastPoint[1] - prevPoint[1];
                        const headingRad = Math.atan2(dLng, dLat);
                        const headingDeg = headingRad * (180 / Math.PI);
                        markerUAV.current.setIcon(IconUAV(headingDeg));
                    }
                }
            }
        }

        alert("Loaded simulasi: " + mission.name);
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

                <LongLatSim
                    coords={coords}
                    recordingTime={recordingTime}
                    distance={distance}
                    isRecording={isRecording}
                />

                <div className="plan-menu">
                    <SidebarSim isRecording={isRecording} onToggleRecord={handleToggleRecord} onSave={handleSave} />
                </div>

            </div>

            <div ref={mapContainer} className="map-container" />
        </div>
    );

};

export default Simulator;