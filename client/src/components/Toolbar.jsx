import React from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import '../styles/Toolbar.css';

function Toolbar() {
  const { currentTool, setCurrentTool, camera, setCamera } = useWhiteboardStore();

  const tools = [
    { id: 'select', icon: '✋', label: 'Select' },
    { id: 'pen', icon: '✏️', label: 'Pen' },
    { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
    { id: 'text', icon: 'T', label: 'Text' },
    { id: 'erase', icon: '🗑️', label: 'Erase' },
  ];

  const zoomIn = () => setCamera({ ...camera, zoom: Math.min(camera.zoom * 1.2, 5) });
  const zoomOut = () => setCamera({ ...camera, zoom: Math.max(camera.zoom / 1.2, 0.5) });

  return (
    <div className="toolbar">
      {tools.map(tool => (
        <button
          key={tool.id}
          className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
          onClick={() => setCurrentTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
      <div className="toolbar-divider"></div>
      <button className="tool-btn" onClick={zoomOut} title="Zoom Out">🔍−</button>
      <button className="tool-btn" onClick={zoomIn} title="Zoom In">🔍+</button>
    </div>
  );
}

export default Toolbar;