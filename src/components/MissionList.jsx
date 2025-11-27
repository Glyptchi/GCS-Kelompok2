import React, { useEffect, useState } from "react";

const Cari = "../src/assets/Cari.svg";

const MissionList = ({ onLoad, onRename, onDelete, refreshTrigger }) => {
  const [missions, setMissions] = useState([]);
  const [search, setSearch] = useState("");

  // Load missions dari backend, sekarang hanya ambil tipe plan
  const fetchMissions = async () => {
    const res = await fetch("http://localhost:3000/missions?type=plan");
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
      body: JSON.stringify({ name: newName, data: m.data })
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
      }}>
        <img src={Cari} style={{
          marginLeft: 0,
          width: 20,
          height: 20,
        }} />
        <input type="text" placeholder="Cari plan..."
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

      <h3 style={{ marginBottom: "10px", marginTop: "10px", }}>Mission Saves</h3>

      {missions
        .filter(m =>
          m.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          const sa = a.name.toLowerCase().indexOf(search.toLowerCase());
          const sb = b.name.toLowerCase().indexOf(search.toLowerCase());
          return sa - sb;
        })
        .map((m) => (
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
