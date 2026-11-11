import { useEffect, useState } from "react";
import "./MissionList.css"
import Cari from "../assets/Cari.svg";

const API_BASE = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

const MissionList = ({ onLoad, onRename, onDelete, refreshTrigger, onEdit }) => {
  const [missions, setMissions] = useState([]);
  const [search, setSearch] = useState("");

  // Load missions dari backend, sekarang hanya ambil tipe plan
  const fetchMissions = async () => {
    const res = await fetch(`${API_BASE}/missions`);
    const data = await res.json();

    const withMenu = data.map(m => ({ ...m, showMenu: false }));
    setMissions(withMenu);
  };


  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/missions`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => setMissions(data.map((mission) => ({ ...mission, showMenu: false }))))
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Gagal memuat mission:', error);
      });
    return () => controller.abort();
  }, [refreshTrigger]);

  const handleRename = async (m) => {
    const newName = prompt("Rename mission:", m.name);
    if (!newName) return;

    await fetch(`${API_BASE}/missions/${m.id}`, {
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

    await fetch(`${API_BASE}/missions/${m.id}`, {
      method: "DELETE"
    });

    fetchMissions();
    if (onDelete) onDelete();
  };

  const filteredMissions = missions
    .filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const A = a.name.toLowerCase().indexOf(search.toLowerCase());
      const B = b.name.toLowerCase().indexOf(search.toLowerCase());
      return A - B;
    });


  return (
    <div className="ml-container">
      <div className="ml-search">
        <img src={Cari} className="ml-search-icon" />
        <input
          type="text"
          placeholder="Cari plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-search-input"
        />
      </div>

      <h3 className="ml-title">Mission Saves</h3>

      {filteredMissions.map((m) => (
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
          <span style={{ cursor: "pointer" }} onClick={() => onLoad(m)}>{m.name}</span>

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

                <div className="ml-menu-item" onClick={() => {
                  if (onEdit) onEdit(m);
                  // Close menu
                  setMissions(prev => prev.map(x => ({ ...x, showMenu: false })));
                }}>Edit</div>

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
