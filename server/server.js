const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();
const users = new Map();

class WhiteboardRoom {
  constructor(id) {
    this.id = id;
    this.shapes = [];
    this.users = [];
    this.locks = new Map();
  }

  addShape(shape) {
    this.shapes.push(shape);
    return shape;
  }

  updateShape(id, updates) {
    const shape = this.shapes.find(s => s.id === id);
    if (shape) {
      Object.assign(shape, updates);
    }
    return shape;
  }

  removeShape(id) {
    this.shapes = this.shapes.filter(s => s.id !== id);
  }

  lockShape(shapeId, userId) {
    this.locks.set(shapeId, userId);
  }

  unlockShape(shapeId) {
    this.locks.delete(shapeId);
  }

  getShapeLock(shapeId) {
    return this.locks.get(shapeId);
  }
}

io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on('join-room', (roomId, userData) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new WhiteboardRoom(roomId));
    }

    const room = rooms.get(roomId);
    users.set(socket.id, { ...userData, socketId: socket.id, roomId });
    room.users.push(socket.id);

    socket.emit('room-initialized', {
      shapes: room.shapes,
      users: room.users.map(uid => users.get(uid))
    });

    socket.to(roomId).emit('user-joined', {
      user: users.get(socket.id)
    });
  });

  socket.on('draw-shape', ({ roomId, shape }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.addShape(shape);
      io.to(roomId).emit('shape-added', { shape });
    }
  });

  socket.on('update-shape', ({ roomId, shapeId, updates }) => {
    const room = rooms.get(roomId);
    if (room) {
      const lock = room.getShapeLock(shapeId);
      if (!lock || lock === socket.id) {
        room.updateShape(shapeId, updates);
        io.to(roomId).emit('shape-updated', { shapeId, updates });
      }
    }
  });

  socket.on('delete-shape', ({ roomId, shapeId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.removeShape(shapeId);
      io.to(roomId).emit('shape-deleted', { shapeId });
    }
  });

  socket.on('lock-shape', ({ roomId, shapeId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.lockShape(shapeId, socket.id);
      io.to(roomId).emit('shape-locked', { shapeId, userId: socket.id });
    }
  });

  socket.on('unlock-shape', ({ roomId, shapeId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.unlockShape(shapeId);
      io.to(roomId).emit('shape-unlocked', { shapeId });
    }
  });

  socket.on('cursor-move', ({ roomId, x, y }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(roomId).emit('cursor-moved', {
        userId: socket.id,
        userName: user.name,
        color: user.color,
        x,
        y
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const room = rooms.get(user.roomId);
      if (room) {
        room.users = room.users.filter(uid => uid !== socket.id);
        io.to(user.roomId).emit('user-left', { userId: socket.id });
      }
    }
    users.delete(socket.id);
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});