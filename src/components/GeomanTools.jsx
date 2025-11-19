import React, { useEffect } from "react";
import "./GeomanTools.css";

const ICON = "../src/assets/Dummy.svg";

const GeomanTools = ({ map }) => {
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
    click("gm-text", () => map.pm.enableDraw("Text"));

    click("gm-edit", () => map.pm.toggleGlobalEditMode());
    click("gm-drag", () => map.pm.toggleGlobalDragMode());
    click("gm-cut", () => map.pm.enableGlobalCutMode());
    click("gm-remove", () => map.pm.enableGlobalRemovalMode());
    click("gm-rotate", () => map.pm.enableGlobalRotateMode());
  }, [map]);

  return (
    <div className="gm-toolbar">

      {/* DRAW */}
      <img id="gm-marker" className="gm-icon" src={ICON} title="Draw Marker" />
      <img id="gm-polyline" className="gm-icon" src={ICON} title="Draw Polyline" />
      <img id="gm-rectangle" className="gm-icon" src={ICON} title="Draw Rectangle" />
      <img id="gm-polygon" className="gm-icon" src={ICON} title="Draw Polygon" />
      <img id="gm-circle" className="gm-icon" src={ICON} title="Draw Circle" />
      <img id="gm-circlemarker" className="gm-icon" src={ICON} title="Draw Circle Marker" />
      <img id="gm-text" className="gm-icon" src={ICON} title="Draw Text" />

      {/* TOOLS */}
      <img id="gm-edit" className="gm-icon" src={ICON} title="Edit Layers" />
      <img id="gm-drag" className="gm-icon" src={ICON} title="Drag Layers" />
      <img id="gm-cut" className="gm-icon" src={ICON} title="Cut Layers" />
      <img id="gm-remove" className="gm-icon" src={ICON} title="Remove Layers" />
      <img id="gm-rotate" className="gm-icon" src={ICON} title="Rotate Layers" />

    </div>
  );
};

export default GeomanTools;
