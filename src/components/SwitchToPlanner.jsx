import React from "react";
import { useNavigate } from "react-router-dom";
import "./SwitchButton.css";

const SwitchToPlanner = () => {
  const navigate = useNavigate();

  return (
    <div className="switch-btn-container" onClick={() => navigate("/")}>
      <div className="switch-left">
        <span>SWITCH TO</span>
      </div>

      <div className="switch-right">
        <img src="/icon-simulator.svg" alt="icon" className="switch-icon" />
        <div className="switch-text">
          <span>SIMULATION</span>
          <span>MODE</span>
        </div>
      </div>
    </div>
  );
};

export default SwitchToPlanner;
