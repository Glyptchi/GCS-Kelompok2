import React, { useEffect, useState } from "react";
import "./Sidebar.css";

const SidebarSim = ({ isRecording, onToggleRecord }) => {
  return (
    <div className="sim-tools-container">

      <div className="sim-tools-top" onClick={onToggleRecord} style={{ cursor: "pointer" }}>
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

    </div>
  );
};

export default SidebarSim;
