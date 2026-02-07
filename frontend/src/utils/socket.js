import { io } from 'socket.io-client';

let socket = null;

export function initSocket() {
  if (socket) return socket;
  const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api','') : 'http://localhost:5000';
  const token = localStorage.getItem('token');
  socket = io(url, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
