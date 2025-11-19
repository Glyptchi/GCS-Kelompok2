import React from "react";
import { useNavigate } from "react-router-dom";
import PlanIcon from "../assets/MissionPlanner.svg";  

import "./SwitchButton.css";

const SwitchToSimulator = () => {
  const navigate = useNavigate();

  return (
    <button className="switch-icon-btn" onClick={() => navigate("/")}>
      <img src={PlanIcon} alt="sim" />
    </button>
  );
};

export default SwitchToSimulator;
