import io from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.listeners = {};
  }

  connect(roomId, userData) {
    this.socket = io('https://infinite-whiteboard-backend.onrender.com');
    this.roomId = roomId;

    this.socket.emit('join-room', roomId, userData);
    this.socket.on('room-initialized', (data) => this.emit('room-init', data));
    this.socket.on('shape-added', (data) => this.emit('shape-added', data.shape));
    this.socket.on('shape-updated', (data) => this.emit('shape-updated', data));
    this.socket.on('shape-deleted', (data) => this.emit('shape-deleted', data));
    this.socket.on('cursor-moved', (data) => this.emit('cursor-moved', data));
  }

  drawShape(shape) {
    this.socket.emit('draw-shape', { roomId: this.roomId, shape });
  }

  updateShape(shapeId, updates) {
    this.socket.emit('update-shape', { roomId: this.roomId, shapeId, updates });
  }

  deleteShape(shapeId) {
    this.socket.emit('delete-shape', { roomId: this.roomId, shapeId });
  }

  lockShape(shapeId) {
    this.socket.emit('lock-shape', { roomId: this.roomId, shapeId });
  }

  unlockShape(shapeId) {
    this.socket.emit('unlock-shape', { roomId: this.roomId, shapeId });
  }

  moveCursor(x, y) {
    this.socket.emit('cursor-move', { roomId: this.roomId, x, y });
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default SocketManager;
