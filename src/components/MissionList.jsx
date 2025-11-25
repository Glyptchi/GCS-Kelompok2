import React, { useEffect, useState } from "react";

const MissionList = ({ onLoad, onRename, onDelete }) => {
  const [missions, setMissions] = useState([]);

  // Load missions dari backend
  const fetchMissions = async () => {
    const res = await fetch("http://localhost:3000/missions");
    const data = await res.json();
    setMissions(data);
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleRename = async (m) => {
    const newName = prompt("Rename mission:", m.name);
    if (!newName) return;

    await fetch(`http://localhost:3000/missions/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, data: JSON.parse(m.data) })
    });

    fetchMissions();
    if (onRename) onRename();
  };

  const handleDelete = async (m) => {
    const ok = confirm(`Delete mission "${m.name}"?`);
    if (!ok) return;

    await fetch(`http://localhost:3000/missions/${m.id}`, {
      method: "DELETE"
    });

    fetchMissions();
    if (onDelete) onDelete();
  };

  return (
    <div style={{
      width: "100%",
      padding: "15px",
      fontFamily: "Helvetica",
      color: "#23315A"
    }}>
      <h3 style={{ marginBottom: "10px" }}>Mission Saves</h3>

      {missions.map((m) => (
        <div key={m.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 10px",
            background: "#f7f8fa",
            borderRadius: "6px",
            marginBottom: "8px",
            cursor: "pointer"
          }}
        >
          {/* LOAD mission */}
          <span onClick={() => onLoad(m)}>{m.name}</span>

          {/* menu button */}
          <div style={{ cursor: "pointer", fontSize: "20px" }}>
            <span onClick={() => {
              const act = prompt("1 = Rename\n2 = Delete");
              if (act === "1") handleRename(m);
              if (act === "2") handleDelete(m);
            }}>⋮</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MissionList;
