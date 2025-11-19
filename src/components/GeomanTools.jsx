import React, { useEffect } from "react";
import "./GeomanTools.css";
import { Marker } from "leaflet";

const ICON = "../src/assets/Dummy.svg";
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
      <img id="gm-marker" className="gm-icon" src={DrawMarker} title="Draw Marker" />
      <img id="gm-polyline" className="gm-icon" src={DrawPolyline} title="Draw Polyline" />
      <img id="gm-rectangle" className="gm-icon" src={DrawRectangle} title="Draw Rectangle" />
      <img id="gm-polygon" className="gm-icon" src={DrawPolygon} title="Draw Polygon" />
      <img id="gm-circle" className="gm-icon" src={DrawCircle} title="Draw Circle" />
      <img id="gm-circlemarker" className="gm-icon" src={DrawCircleMarker} title="Draw Circle Marker" />
      <img id="gm-text" className="gm-icon" src={Text} title="Draw Text" />

      {/* TOOLS */}
      <img id="gm-edit" className="gm-icon" src={Edit} title="Edit Layers" />
      <img id="gm-drag" className="gm-icon" src={Drag} title="Drag Layers" />
      <img id="gm-cut" className="gm-icon" src={Cut} title="Cut Layers" />
      <img id="gm-remove" className="gm-icon" src={Remove} title="Remove Layers" />
      <img id="gm-rotate" className="gm-icon" src={Rotate} title="Rotate Layers" />

    </div>
  );
};

export default GeomanTools;
