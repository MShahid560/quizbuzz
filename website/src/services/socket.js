import { io } from 'socket.io-client';

const getSocketURL = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Use same IP the website is served from
  return `http://${hostname}:5000`;
};

const socket = io(getSocketURL(), {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'] // ← important for mobile!
});

export default socket;