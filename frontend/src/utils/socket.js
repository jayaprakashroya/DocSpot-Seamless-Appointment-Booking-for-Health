import { io } from 'socket.io-client';

let socket = null;

export function initSocket(userId) {
  if (socket && socket.connected) {
    return socket;
  }
  
  const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api','') : 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  socket = io(url, { 
    auth: { token }, 
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    forceNew: false
  });
  
  // Handle socket connection
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    // Auto-reconnect will happen automatically with reconnection: true
  });
  
  // Handle connection error
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    // Don't disconnect on error, let auto-reconnect handle it
  });
  
  // Listen for token expiration from server
  socket.on('tokenExpired', () => {
    console.warn('Token expired on server');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      window.dispatchEvent(new Event('authChanged'));
    } catch (e) {}
    window.location.href = '/login?session_expired=true';
  });
  
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

export function isSocketConnected() {
  return socket && socket.connected;
}
