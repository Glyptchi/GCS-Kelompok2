/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import "./MissionList.css"

const MissionList = ({ onLoad, onRename, onDelete, refreshTrigger }) => {
  const [missions, setMissions] = useState([]);
  const [search, setSearch] = useState("");

  // Load missions dari backend, sekarang hanya ambil tipe plan
  const fetchMissions = async () => {
  const res = await fetch("http://localhost:3000/missions");
  const data = await res.json();

  const withMenu = data.map(m => ({ ...m, showMenu: false }));
  setMissions(withMenu);
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
    <div className="ml-container">
      <div className="ml-search">
        <img src={"../src/assets/Cari.svg"} className="ml-search-icon" />
        <input
          type="text"
          placeholder="Cari plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-search-input"
        />
      </div>

      <h3 className="ml-title">Mission Saves</h3>

      {missions.map((m) => (
        <div className="ml-item" key={m.id}>
          <span className="ml-item-name" onClick={() => onLoad(m)}>
            {m.name}
          </span>

          <div className="ml-dots">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setMissions(prev =>
                  prev.map(x =>
                    x.id === m.id
                      ? { ...x, showMenu: !x.showMenu }
                      : { ...x, showMenu: false }
                  )
                );
              }}
            >
              ⋮
            </span>

            {m.showMenu && (
              <div className="ml-menu">
                <div className="ml-menu-item" onClick={() => handleRename(m)}>
                  Rename
                </div>

                <div className="ml-menu-item">Edit</div>

                <div
                  className="ml-menu-item delete"
                  onClick={() => handleDelete(m)}
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
};

export default MissionList;
