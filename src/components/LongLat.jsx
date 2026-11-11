const Compass = "../src/assets/Kompas.svg";

const LongLat = ({coords, onResetView}) => {

  return (

    <div className="card-wrapper"> 
    {/* LongLat */}
        <div className="card1">
            <h4 style={{color:'#23315A'}} className='status'>Plan Status</h4>
            <div style={{color:'#23315A'}} className="longlat-row">
                <span>Longitude:</span>
                <span>{coords.lng ?? "-"}</span>
            </div>
            <div style={{color:'#23315A'}}className="longlat-row">
                <span>Latitude:</span>
                <span>{coords.lat ?? "-"}</span>
            </div>
        </div>

        {/*Kompas*/}
        <div className='kompas'>
            <button className='kompas-btn'
                onClick={onResetView}>
                <img src={Compass} alt='Kompas'></img>
            </button>
        </div>
    </div> 

  )
}

export default LongLat
