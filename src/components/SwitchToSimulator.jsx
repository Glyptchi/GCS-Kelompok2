import React from "react";
import { useNavigate } from "react-router-dom";
import "./SwitchButton.css";
import Simulator from "../Pages/SImulator";

const SwitchToSimulator = () => {
  const navigate = useNavigate();

  return (
    <div className="switch-btn-container" onClick={() => navigate("/Simulator")}>
      <div className="switch-left" onClick={() => navigate("/Simulator")}>
        <span>SWITCH TO</span>
      </div>

      <div className="switch-right">
        <img src={`../src/assets/Simulator.svg`} className="switch-icon" />
        <div className="switch-text">
          <span>SIMULATOR</span>
        </div>
      </div>
    </div>
  );
};

export default SwitchToSimulator;
