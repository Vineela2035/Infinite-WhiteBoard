import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useWhiteboardStore = create((set, get) => ({
  // State
  shapes: [],
  camera: { x: 0, y: 0, zoom: 1 },
  currentTool: 'select',
  isDrawing: false,
  selectedShapeId: null,
  remoteCursors: new Map(),

  // Actions
  addShape: (shape) => set((state) => ({
    shapes: [...state.shapes, { ...shape, id: shape.id || nanoid() }]
  })),

  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  deleteShape: (id) => set((state) => ({
    shapes: state.shapes.filter(s => s.id !== id)
  })),

  setShapes: (shapes) => set({ shapes }),

  setCamera: (camera) => set({ camera }),

  setCurrentTool: (tool) => set({ currentTool: tool }),

  setIsDrawing: (drawing) => set({ isDrawing: drawing }),

  setSelectedShape: (id) => set({ selectedShapeId: id }),

  setRemoteCursor: (userId, cursor) => set((state) => {
    const cursors = new Map(state.remoteCursors);
    if (cursor) {
      cursors.set(userId, cursor);
    } else {
      cursors.delete(userId);
    }
    return { remoteCursors: cursors };
  }),

  clearShapes: () => set({ shapes: [] }),

  // Helper to get current state
  getState: () => get()
}));