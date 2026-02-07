let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.IO not initialized');
  return ioInstance;
}

function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  const room = `user_${userId}`;
  ioInstance.to(room).emit(event, payload);
}

module.exports = { setIO, getIO, emitToUser };
