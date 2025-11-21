import React from "react";
import { useNavigate } from "react-router-dom";
import PlanIcon from "../assets/MissionPlanner.svg";

import "./SwitchButton.css";

const SwitchToPlanner = () => {
  const navigate = useNavigate();

  return (
    <button className="switch-icon-btn" title= "Planner Mode" onClick={() => navigate("/")}>
      <img src={PlanIcon} alt="planner" />
    </button>
  );
};

export default SwitchToPlanner;
