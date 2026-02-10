const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
const http = require('http');
const { Server } = require('socket.io');
const socketService = require('./services/socketService');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB with retry logic
connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MediConnect Seamless Appointment Booking API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      health_detailed: '/api/health/detailed',
      users: '/api/users',
      doctors: '/api/doctors',
      admin: '/api/admin',
      appointments: '/api/appointments'
    }
  });
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health/detailed', async (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host || 'Not connected',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
    }
  });
});

// Centralized error handling (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
	cors: { origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }
});

const jwt = require('jsonwebtoken');

// JWT-based socket authentication
io.use((socket, next) => {
	try {
		const token = socket.handshake.auth && socket.handshake.auth.token;
		if (!token) return next();
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
		// attach user id on socket
		socket.userId = decoded.id;
		return next();
	} catch (err) {
		return next();
	}
});

io.on('connection', (socket) => {
	// If userId is present, join personal room
	if (socket.userId) {
		socket.join(`user_${socket.userId}`);
	}
});

socketService.setIO(io);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received. Starting graceful shutdown...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT signal received. Starting graceful shutdown...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});
