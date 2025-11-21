import React from "react";
import { useNavigate } from "react-router-dom";
import SimIcon from "../assets/SimulatorKuning.svg";  

import "./SwitchButton.css";

const SwitchToSimulator = () => {
  const navigate = useNavigate();

  return (
    <button className="switch-icon-btn" title= "Simulator Mode" onClick={() => navigate("/Simulator")}>
      <img src={SimIcon} alt="sim" />
    </button>
  );
};

export default SwitchToSimulator;
