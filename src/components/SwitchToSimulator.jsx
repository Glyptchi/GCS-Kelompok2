import React from "react";
import { useNavigate } from "react-router-dom";
import SimIcon from "../assets/Simulator.svg";  

import "./SwitchButton.css";

const SwitchToSimulator = () => {
  const navigate = useNavigate();

  return (
    <button className="switch-icon-btn" onClick={() => navigate("/Simulator")}>
      <img src={SimIcon} alt="sim" />
    </button>
  );
};

export default SwitchToSimulator;
