import React, { useRef, useEffect, useState } from 'react';
import { useWhiteboardStore } from '../store/whiteboardStore';
import ShapeRenderer from './ShapeRenderer';
import CursorRenderer from './CursorRenderer';
import '../styles/CanvasLayer.css';

function CanvasLayer({ socketManager }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const {
    shapes, camera, currentTool, addShape, updateShape, deleteShape, 
    setCamera, remoteCursors, selectedShapeId, setSelectedShape
  } = useWhiteboardStore();

  useEffect(() => {
    socketManager.on('shape-added', (shape) => addShape(shape));
    socketManager.on('shape-updated', ({ shapeId, updates }) => updateShape(shapeId, updates));
    socketManager.on('shape-deleted', ({ shapeId }) => deleteShape(shapeId));
    socketManager.on('cursor-moved', (cursor) => {
      useWhiteboardStore.setState(state => ({
        remoteCursors: new Map(state.remoteCursors).set(cursor.userId, cursor)
      }));
    });
  }, [socketManager]);

  const screenToCanvas = (x, y) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (x - rect.left - camera.x) / camera.zoom,
      y: (y - rect.top - camera.y) / camera.zoom
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (currentTool === 'select') {
      const clickedShape = [...shapes].reverse().find(s => pointInShape(x, y, s));
      setSelectedShape(clickedShape?.id || null);
      if (clickedShape) {
        socketManager.lockShape(clickedShape.id);
      }
    } else if (['pen', 'rectangle'].includes(currentTool)) {
      setIsDrawing(true);
      setStartPoint({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    socketManager.moveCursor(x, y);

    if (isDrawing && startPoint && currentTool === 'rectangle') {
      const w = x - startPoint.x;
      const h = y - startPoint.y;
      // Preview will be shown in rendering
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPoint) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const newShape = {
      type: currentTool,
      x: startPoint.x,
      y: startPoint.y,
      width: x - startPoint.x,
      height: y - startPoint.y,
      color: '#4a90e2',
      opacity: 0.8
    };

    socketManager.drawShape(newShape);
    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setCamera({
      ...camera,
      zoom: Math.max(0.5, Math.min(5, camera.zoom * factor))
    });
  };

  const handlePan = (e) => {
    if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      const onMouseMove = (moveE) => {
        setCamera({
          ...camera,
          x: camera.x + moveE.movementX,
          y: camera.y + moveE.movementY
        });
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handlePan}
      />
      <ShapeRenderer canvasRef={canvasRef} screenToCanvas={screenToCanvas} />
      <CursorRenderer canvasRef={canvasRef} />
    </div>
  );
}

function pointInShape(x, y, shape) {
  if (shape.type === 'rectangle') {
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  }
  return false;
}

export default CanvasLayer;
