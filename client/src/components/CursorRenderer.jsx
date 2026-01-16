import React, { useEffect } from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';

function CursorRenderer({ canvasRef }) {
  const remoteCursors = useWhiteboardStore(s => s.remoteCursors);

  useEffect(() => {
    remoteCursors.forEach((cursor) => {
      const cursorEl = document.getElementById(`cursor-${cursor.userId}`);
      if (cursorEl) {
        cursorEl.style.left = cursor.x + 'px';
        cursorEl.style.top = cursor.y + 'px';
      } else {
        const el = document.createElement('div');
        el.id = `cursor-${cursor.userId}`;
        el.className = 'remote-cursor';
        el.style.borderColor = cursor.color;
        el.innerHTML = `<span class="cursor-name">${cursor.userName}</span>`;
        document.body.appendChild(el);
      }
    });
  }, [remoteCursors]);

  return null;
}

export default CursorRenderer;