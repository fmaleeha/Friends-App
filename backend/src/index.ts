import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { eventsRouter } from './routes/events.js';
import { celebrityRouter } from './routes/celebrity.js';
import { walletRouter } from './routes/wallet.js';
import { supportRouter } from './routes/support.js';
import { adminRouter } from './routes/admin.js';
import { chatRouter } from './routes/chat.js';
import { setupSignalingGateway } from './signaling.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for web client
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Setup Socket.io WebRTC signaling
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSignalingGateway(io);

// Mount REST APIs
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/celebrities', celebrityRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Friends App Backend API & WebRTC Signaling Server',
    timestamp: new Date().toISOString(),
    supportedRoles: ['USER', 'ORGANIZATION', 'CELEBRITY', 'SUPPORT', 'SUPER_ADMIN'],
    supportedMedia: ['AUDIO', 'VIDEO'],
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Friends App Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket Signaling Gateway ready on ws://localhost:${PORT}`);
  console.log(`🔗 REST API Root: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
