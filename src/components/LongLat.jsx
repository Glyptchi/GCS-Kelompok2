import React from 'react'
import { getMap } from '../components/MapStore';

const LongLat = ({coords}) => {
  
    const handleClick = () => {
        const map = getMap();
        if (!map) return;         // biar ga error kalau belum ready
        map.setView([-7.771337528683765, 110.3774982677273], 18);
    };

  return (

    <div className="card-wrapper"> 
    {/* LongLat */}
        <div className="card1">
            <h4 className='status'>Plane Status</h4>
            <div className="longlat-row">
                <span>Longitude:</span>
                <span>{coords.lng ?? "-"}</span>
            </div>
            <div className="longlat-row">
                <span>Latitude:</span>
                <span>{coords.lat ?? "-"}</span>
            </div>
            <div className="recording">
                <span>Recording</span>
            </div>
        </div>

        {/*Kompas*/}
        <div className='kompas'>
            <button className='kompas-btn' onClick={handleClick}>
                <img src='https://img.icons8.com/?size=100&id=2o-uXx1sRKa7&format=png&color=000000' alt='Kompas'></img>
            </button>
        </div>
    </div> 

  )
}

export default LongLat