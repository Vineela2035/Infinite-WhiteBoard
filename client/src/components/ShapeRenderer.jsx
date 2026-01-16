import React, { useEffect, useRef } from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';

function ShapeRenderer({ canvasRef, screenToCanvas }) {
  const { shapes, camera } = useWhiteboardStore();
  const ctx = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.current = canvas.getContext('2d');
    const context = ctx.current;

    context.fillStyle = '#f5f5f5';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(camera.x, camera.y);
    context.scale(camera.zoom, camera.zoom);

    shapes.forEach(shape => {
      context.fillStyle = shape.color;
      context.globalAlpha = shape.opacity;

      if (shape.type === 'rectangle') {
        context.fillRect(shape.x, shape.y, shape.width, shape.height);
        context.strokeStyle = '#333';
        context.lineWidth = 2;
        context.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
    });

    context.globalAlpha = 1;
    context.restore();
  }, [shapes, camera]);

  return null;
}

export default ShapeRenderer;