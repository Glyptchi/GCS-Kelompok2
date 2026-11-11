import L from 'leaflet';
import map, { planModeLG } from '../baseMap/leaflet';
import './GeomanTools.css';

import markerIcon from '../assets/Marker.svg';
import polylineIcon from '../assets/PolyLine.svg';
import rectangleIcon from '../assets/Rectangle.svg';
import polygonIcon from '../assets/Polygon.svg';
import circleIcon from '../assets/DrawCircle.svg';
import circleMarkerIcon from '../assets/DrawCircleMarker.svg';
import textIcon from '../assets/Text.svg';
import editIcon from '../assets/EditLayers.svg';
import dragIcon from '../assets/DragLayers.svg';
import cutIcon from '../assets/CutLayers.svg';
import removeIcon from '../assets/RemoveLayers.svg';
import rotateIcon from '../assets/RotateLayers.svg';
import saveIcon from '../assets/Save.svg';

const drawTools = [
  ['gm-marker', markerIcon, 'Marker', 'Draw Marker (1)'],
  ['gm-polyline', polylineIcon, 'Line', 'Draw Polyline (2)'],
  ['gm-rectangle', rectangleIcon, 'Rectangle', 'Draw Rectangle (3)'],
  ['gm-polygon', polygonIcon, 'Polygon', 'Draw Polygon (4)'],
  ['gm-circle', circleIcon, 'Circle', 'Draw Circle (5)'],
  ['gm-circlemarker', circleMarkerIcon, 'CircleMarker', 'Draw Circle Marker (6)'],
  ['gm-text', textIcon, 'Text', 'Draw Text (T)'],
];
const editTools = [
  ['gm-edit', editIcon, 'toggleGlobalEditMode', 'Edit Layers (E)'],
  ['gm-drag', dragIcon, 'toggleGlobalDragMode', 'Drag Layers (M)'],
  ['gm-cut', cutIcon, 'enableGlobalCutMode', 'Cut Layers (C)'],
  ['gm-remove', removeIcon, 'enableGlobalRemovalMode', 'Delete Layers (D)'],
  ['gm-rotate', rotateIcon, 'enableGlobalRotateMode', 'Rotate Layers (R)'],
];

export default function GeomanTools({ onSaved, editingId, editingName, onUpdate }) {
  async function handleSave() {
    const geojson = planModeLG.getLayers().map((layer) => {
      const feature = layer.toGeoJSON();
      if (layer instanceof L.CircleMarker) {
        feature.properties = {
          ...feature.properties,
          radius: layer.getRadius(),
          layerType: layer instanceof L.Circle ? 'Circle' : 'CircleMarker',
        };
      }
      return feature;
    });
    const name = prompt('Nama mission?', editingName || '');
    if (!name) return;
    const base = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    try {
      const response = await fetch(`${base}/missions${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: geojson, type: 'plan' }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      alert(editingId ? 'Mission updated!' : 'Mission saved!');
      if (editingId) onUpdate?.();
      else onSaved?.();
    } catch (error) {
      console.error(error);
      alert('Error saving mission');
    }
  }

  return (
    <div className="gm-toolbar">
      <div className="gm-toolbar-top">
        <span className="toolbar-label">Draw</span>
        {drawTools.map(([id, icon, shape, title]) => (
          <button key={id} id={id} className="gm-tool-button" title={title}
            onClick={() => map.pm.enableDraw(shape)}>
            <img className="gm-icon" src={icon} alt={title} />
          </button>
        ))}
        <span className="toolbar-label">Tools</span>
        {editTools.map(([id, icon, method, title]) => (
          <button key={id} id={id} className="gm-tool-button" title={title}
            onClick={() => map.pm[method]()}>
            <img className="gm-icon" src={icon} alt={title} />
          </button>
        ))}
      </div>
      <div className="gm-toolbar-bottom">
        <button className="gm-tool-button" title="Save mission" onClick={handleSave}>
          <img className="gm-icon" src={saveIcon} alt="Save mission" />
        </button>
      </div>
    </div>
  );
}
