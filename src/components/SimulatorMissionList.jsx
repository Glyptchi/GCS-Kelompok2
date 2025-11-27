import React, { useEffect, useState } from "react";

const Cari = "../src/assets/Cari.svg";

const SimulatorMissionList = ({ onLoad, onRename, onDelete, refreshTrigger }) => {
    const [missions, setMissions] = useState([]);
    const [search, setSearch] = useState("");

    // Load missions dari backend (type=simulator)
    const fetchMissions = async () => {
        const res = await fetch("http://localhost:3000/missions?type=simulator");
        const data = await res.json();
        setMissions(data);
    };

    useEffect(() => {
        fetchMissions();
    }, [refreshTrigger]);

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
            <div style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
            }}>
                <img src={Cari} style={{
                    marginLeft: 0,
                    width: 20,
                    height: 20,
                }} />
                <input type="text" placeholder="Cari simulasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        border: "none",
                        minWidth: 0,
                        boxSizing: "border-box",
                        background: "transparent",
                        flex: 1,
                        marginLeft: 3,
                        fontSize: "16px"
                    }}
                />
            </div>

            <h3 style={{ marginBottom: "10px", marginTop: "10px", }}>Simulator Saves</h3>

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
      position: "relative"   // penting untuk menu floating
    }}
  >
    {/* LOAD mission */}
    <span style={{ cursor: "pointer"}} onClick={() => onLoad(m)}>{m.name}</span>

    {/* titik tiga + menu */}
    <div style={{ cursor: "pointer", fontSize: "20px", position: "relative" }}>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setMissions(prev =>
            prev.map(x =>
              x.id === m.id ? { ...x, showMenu: !x.showMenu } : { ...x, showMenu: false }
            )
          );
        }}
      >
        ⋮
      </span>

      {/* MENU KECIL */}
      {m.showMenu && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "25px",
          background: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          borderRadius: "6px",
          padding: "5px 0",
          zIndex: 10,
          width: "110px"
        }}>
          <div
            onClick={() => handleRename(m)}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#23315A",
              borderBottom: "1px solid #eee"
            }}
          >
            Rename
          </div>

        <div
          style={{
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#23315A",
              borderBottom: "1px solid #eee"
            }}
          >
            Edit
          </div>

          <div
            onClick={() => handleDelete(m)}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "14px",
              color: "red"
            }}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  </div>
))}
        </div>
    );
}

export default SimulatorMissionList;
