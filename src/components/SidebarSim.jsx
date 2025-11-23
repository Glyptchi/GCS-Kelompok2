import React, { useEffect, useState } from "react";
import "./Sidebar.css";

const SidebarSim = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleRecord = () => {
    setIsRecording(prev => !prev);
  };

  return (
    <div className="sim-tools-container">

      <div className="sim-tools-top" onClick={handleToggleRecord} style={{ cursor: "pointer" }}>
          <span style={{ color: 'white', fontFamily: 'Helvetica', fontSize: '80%' }}>
              {isRecording ? "STOP" : "REC"}
          </span>

          <img 
            src={isRecording ? "/src/assets/Stop.svg" : "/src/assets/Start.svg"} 
            alt={isRecording ? "Stop Recording" : "Start Recording"} 
            className="sim-icon" 
            title={isRecording ? "Stop Recording" : "Start Recording"}
          />
      </div>

      <div className="sim-tools-bottom">
          <img src="/src/assets/Save.svg" className="sim-icon" />
          <img src="/Dummy.svg" className="sim-icon" />
      </div>

    </div>
  );
};

export default SidebarSim;
