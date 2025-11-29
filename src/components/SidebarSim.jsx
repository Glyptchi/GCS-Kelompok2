import React, { useEffect, useState } from "react";
import "./Sidebar.css";

const SidebarSim = ({ isRecording, onToggleRecord, onSave }) => {
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

      <div className="sim-tools-bottom">
        <div onClick={onSave} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
          <span style={{ color: 'white', fontFamily: 'Helvetica', fontSize: '80%' }}>SAVE</span>
          <img
            src="/src/assets/Save.svg"
            alt="Save Mission"
            className="sim-icon"
            title="Save Mission"
          />
        </div>
      </div>

    </div>
  );
};

export default SidebarSim;
