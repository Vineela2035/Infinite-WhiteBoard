import React, { useState, useEffect } from 'react';
import { useWhiteboardStore } from './store/whiteboardStore';
import WhiteboardLayout from './components/WhiteboardLayout';
import './App.css';

function App() {
  const [roomId, setRoomId] = useState(null);
  const [userName, setUserName] = useState('');
  const [inputRoom, setInputRoom] = useState('');

  const joinRoom = () => {
    if (inputRoom.trim() && userName.trim()) {
      setRoomId(inputRoom);
    }
  };

  if (!roomId) {
    return (
      <div className="join-container">
        <div className="join-card">
          <h1>Infinite Whiteboard</h1>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      </div>
    );
  }

  return <WhiteboardLayout roomId={roomId} userName={userName} />;
}

export default App;