import React from 'react'
import { mapRef } from '../Pages/Map';

const Compass = "../src/assets/Kompas.svg";

const LongLat = ({coords}) => {
  
    const handleClick = () => {
        const map = getMap();
        if (!map) return;         // biar ga error kalau belum ready
        map.setView([-7.771337528683765, 110.3774982677273], 17);
    };

  return (

    <div className="card-wrapper"> 
    {/* LongLat */}
        <div className="card1">
            <h4 style={{color:'#23315A'}} className='status'>Plane Status</h4>
            <div style={{color:'#23315A'}} className="longlat-row">
                <span>Longitude:</span>
                <span>{coords.lng ?? "-"}</span>
            </div>
            <div style={{color:'#23315A'}}className="longlat-row">
                <span>Latitude:</span>
                <span>{coords.lat ?? "-"}</span>
            </div>
            <div style={{color:'#23315A'}} className="recording">
                <span>Recording</span>
            </div>
        </div>

        {/*Kompas*/}
        <div className='kompas'>
            <button className='kompas-btn' onClick={() => {
                const map = mapRef.current;
                if (!map) return;
                map.setView([-7.771337528683765, 110.3774982677273], 17);;   // langsung panggil setView di sini
            }}>
                <img src={Compass} alt='Kompas'></img>
            </button>
        </div>
    </div> 

  )
}

export default LongLat