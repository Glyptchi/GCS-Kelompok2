/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import "./GeomanTools.css";
import { Marker } from "leaflet";

const DrawMarker = "../src/assets/Marker.svg";
const DrawPolyline = "../src/assets/PolyLine.svg";
const DrawRectangle = "../src/assets/Rectangle.svg";
const DrawPolygon = "../src/assets/Polygon.svg";
const DrawCircle = "../src/assets/DrawCircle.svg";
const DrawCircleMarker = "../src/assets/DrawCircleMarker.svg";
const Text = "../src/assets/Text.svg";
const Edit = "../src/assets/EditLayers.svg";
const Drag = "../src/assets/DragLayers.svg";
const Cut = "../src/assets/CutLayers.svg";
const Remove = "../src/assets/RemoveLayers.svg";
const Rotate = "../src/assets/RotateLayers.svg";


const GeomanTools = ({ map, type = 'plan', onSaved, editingId, editingName, onUpdate }) => {
  useEffect(() => {
    if (!map) return;

    const click = (id, fn) => {
      document.getElementById(id).onclick = fn;
    };

    click("gm-marker", () => map.pm.enableDraw("Marker"));
    click("gm-polyline", () => map.pm.enableDraw("Line"));
    click("gm-rectangle", () => map.pm.enableDraw("Rectangle"));
    click("gm-polygon", () => map.pm.enableDraw("Polygon"));
    click("gm-circle", () => map.pm.enableDraw("Circle"));
    click("gm-circlemarker", () => map.pm.enableDraw("CircleMarker"));

    click("gm-edit", () => map.pm.toggleGlobalEditMode());
    click("gm-drag", () => map.pm.toggleGlobalDragMode());
    click("gm-cut", () => map.pm.enableGlobalCutMode());
    click("gm-remove", () => map.pm.enableGlobalRemovalMode());
    click("gm-rotate", () => map.pm.enableGlobalRotateMode());
  }, [map]);

  const handleSave = async () => {
    if (!map) return;
    const layers = map.pm.getGeomanLayers();

    // convert semua layer ke GeoJSON
    // convert semua layer ke GeoJSON
    const geojson = layers.map(layer => {
      const json = layer.toGeoJSON();
      if (layer instanceof L.Circle && !(layer instanceof L.CircleMarker && layer.options.radius < 100)) {
        json.properties = json.properties || {};
        json.properties.radius = layer.getRadius();
        if (layer._mRadius) {
          json.properties.subType = "Circle";
        }
      }
      if (typeof layer.getRadius === 'function') {
        json.properties = json.properties || {};
        json.properties.radius = layer.getRadius();
        if (Object.getPrototypeOf(layer) === L.Circle.prototype) {
          json.properties.layerType = "Circle";
        } else if (Object.getPrototypeOf(layer) === L.CircleMarker.prototype) {
          json.properties.layerType = "CircleMarker";
        }
      }
      return json;
    });

    const name = prompt("Nama mission?", editingName || "");
    if (!name) return;

    try {
      if (editingId) {
        await fetch(`http://localhost:3000/missions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            data: geojson
          })
        });
        alert("Mission updated!");
        if (onUpdate) onUpdate();
      } else {
        await fetch("http://localhost:3000/missions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            data: geojson
          })
        });
        alert("Mission saved!");
        if (onSaved) onSaved();
      }
    } catch (error) {
      console.error(error);
      alert("Error saving mission");
    }
  };


  return (
    <div className="gm-toolbar">
      <div className="gm-toolbar-top">
        <span style={{ color: 'white', fontFamily: 'Helvetica', fontSize: '80%' }}>Draw</span>
        <img id="gm-marker" className="gm-icon" src={DrawMarker} title="Draw Marker (1)" />
        <img id="gm-polyline" className="gm-icon" src={DrawPolyline} title="Draw Polyline (2)" />
        <img id="gm-rectangle" className="gm-icon" src={DrawRectangle} title="Draw Rectangle (3)" />
        <img id="gm-polygon" className="gm-icon" src={DrawPolygon} title="Draw Polygon (4)" />
        <img id="gm-circle" className="gm-icon" src={DrawCircle} title="Draw Circle (5)" />
        <img id="gm-circlemarker" className="gm-icon" src={DrawCircleMarker} title="Draw Circle Marker (6)" />
        <span> </span>
        <span style={{ color: 'white', fontFamily: 'Helvetica', fontSize: '80%' }}>Tools</span>
        <img id="gm-edit" className="gm-icon" src={Edit} title="Edit Layers (E)" />
        <img id="gm-drag" className="gm-icon" src={Drag} title="Drag Layers (M)" />
        <img id="gm-cut" className="gm-icon" src={Cut} title="Cut Layers (C)" />
        <img id="gm-remove" className="gm-icon" src={Remove} title="Delete Layers (D)" />
        <img id="gm-rotate" className="gm-icon" src={Rotate} title="Rotate Layers (R)" />
      </div>

      <div className="gm-toolbar-bottom">
        <img className="gm-icon" src="/src/assets/Save.svg" onClick={handleSave} />
      </div>

    </div>
  );
};

export default GeomanTools;
