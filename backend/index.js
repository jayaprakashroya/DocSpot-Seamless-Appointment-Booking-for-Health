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

connectDB();

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

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

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
