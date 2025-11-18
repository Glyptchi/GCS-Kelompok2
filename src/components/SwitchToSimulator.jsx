import React from "react";
import { useNavigate } from "react-router-dom";
import SimulatorIcon from "../assets/Simulator.svg";
import "./SwitchButton.css";

const SwitchToSimulator = () => {
  const navigate = useNavigate();

  return (
    <div className="switch-btn-container" onClick={() => navigate("/Simulator")}>
      <div className="switch-left">
        <span>SWITCH TO</span>
      </div>

      <div className="switch-right">
        <img src={SimulatorIcon} className="switch-icon" />
        <div className="switch-text">
          <span>SIMULATOR</span>
        </div>
      </div>
    </div>
  );
};

export default SwitchToSimulator;
