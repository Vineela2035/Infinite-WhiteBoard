import React, { useState, useEffect } from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import Toolbar from './Toolbar.jsx';
import CanvasLayer from './CanvasLayer.jsx';
import SocketManager from '../utils/SocketManager';
import '../styles/WhiteboardLayout.css';

function WhiteboardLayout({ roomId, userName }) {
  const [socketManager] = useState(() => new SocketManager());
  const currentTool = useWhiteboardStore(s => s.currentTool);

  useEffect(() => {
    socketManager.connect(roomId, { name: userName, color: generateColor() });
    return () => socketManager.disconnect();
  }, [roomId]);

  return (
    <div className="whiteboard-layout">
      <Toolbar />
      <CanvasLayer socketManager={socketManager} />
    </div>
  );
}

function generateColor() {
  const colors = ['#e94b3c', '#0066ff', '#00cc00', '#ffaa00', '#9933ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default WhiteboardLayout;