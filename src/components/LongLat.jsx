import React from 'react';

const Compass = "../src/assets/Kompas.svg";

const LongLat = ({coords}) => {
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
            <button className='kompas-btn'>
                <img src={Compass} alt='Kompas'></img>
            </button>
        </div>
    </div> 

  )
}

export default LongLat