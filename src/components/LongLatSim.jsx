import React from 'react';
import { mapRef } from '../Pages/Map';

const Compass = "../src/assets/Kompas.svg";

const LongLatSim = ({ coords, recordingTime, distance, isRecording }) => {

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card-wrapper">
            {/* LongLat */}
            <div className="card1">
                <h4 style={{ color: '#23315A' }} className='status'>Simulator Status</h4>
                <div style={{ color: '#23315A' }} className="longlat-row">
                    <span>Longitude:</span>
                    <span>{coords.lng ?? "-"}</span>
                </div>
                <div style={{ color: '#23315A' }} className="longlat-row">
                    <span>Latitude:</span>
                    <span>{coords.lat ?? "-"}</span>
                </div>

                {/* Added Information */}
                <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                    <div style={{ color: '#23315A' }} className="longlat-row">
                        <span>Recording:</span>
                        <span style={{ color: isRecording ? 'red' : 'inherit', fontWeight: isRecording ? 'bold' : 'normal' }}>
                            {formatTime(recordingTime)}
                        </span>
                    </div>
                    <div style={{ color: '#23315A' }} className="longlat-row">
                        <span>Distance:</span>
                        <span>{distance.toFixed(2)} m</span>
                    </div>
                </div>
            </div>

            {/*Kompas*/}
            <div className='kompas'>
                <button className='kompas-btn'
                        onClick={() => {
                            const map = mapRef.current;
                            if (!map) return;
                            map.setView([-7.771337528683765, 110.3774982677273], 17);   // langsung panggil setView di sini
                        }}>
                    <img src={Compass} alt='Kompas'></img>
                </button>
            </div>
        </div>
    )
}

export default LongLatSim;
