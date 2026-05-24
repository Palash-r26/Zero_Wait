// ── FILE: index.js ── Zero-Wait OPD Kiosk Express Server Entry Point
// Socket.io enabled for real-time insurance alert agent
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const seedDoctors = require('./utils/seedDoctors');
const triageRoutes = require('./routes/triage.routes');
const queueRoutes = require('./routes/queue.routes');
const realtimeRoutes = require('./routes/realtime.routes');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════
// SOCKET.IO SETUP — Real-time alerts
// ═══════════════════════════════════════
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://zero-wait.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io instance to app so middleware can access it via req.app.get('io')
app.set('io', io);

const cookie = require('cookie');
const jwt = require('jsonwebtoken');

// Socket connection handling
io.use((socket, next) => {
  if (!socket.request.headers.cookie) {
    return next(new Error('Authentication error: No cookies'));
  }
  const cookies = cookie.parse(socket.request.headers.cookie);
  const token = cookies.token;
  if (!token) {
    return next(new Error('Authentication error: No token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.user.username})`);

  // Allow clients to join named rooms (e.g., 'staff-dashboard')
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`   └─ ${socket.user.username} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id} (User: ${socket.user.username})`);
  });
});

// ═══════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════

// CORS: Allow React dev servers
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://zero-wait.vercel.app'],
    credentials: true,
  })
);

// Parse JSON request bodies (up to 10MB for base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded ID images as static files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// ═══════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════

// Health check endpoint
app.get('/api/health', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiConfigured =
    Boolean(geminiKey) && geminiKey !== 'your_key_here' && geminiKey !== 'your_key';

  res.json({
    status: 'healthy',
    service: 'Zero-Wait OPD Kiosk API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    socketClients: io.engine.clientsCount,
    ai: {
      gemini: {
        configured: geminiConfigured,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      },
      openaiRealtime: Boolean(process.env.OPENAI_API_KEY),
    },
  });
});

// Auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Triage routes: ID extraction + symptom analysis
app.use('/api/triage', triageRoutes);

// Queue routes: ticket allocation + insurance alert agent
app.use('/api/queue', queueRoutes);
app.use('/api/realtime', realtimeRoutes);

// Doctor Admin routes
const doctorRoutes = require('./routes/doctor.routes');
app.use('/api/doctors', doctorRoutes);

// Analytics routes
const analyticsRoutes = require('./routes/analytics.routes');
app.use('/api/analytics', analyticsRoutes);

// ═══════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);

  // Multer file size/type errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large. Maximum size is 5MB.',
    });
  }

  if (err.message && err.message.includes('Only JPEG')) {
    return res.status(415).json({
      success: false,
      error: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again.',
  });
});

// ═══════════════════════════════════════
// SERVER BOOT
// ═══════════════════════════════════════
const startServer = async () => {
  // Attempt MongoDB connection (non-blocking — server starts regardless)
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    const seedDoctors = require('./utils/seedDoctors');
    await seedDoctors();
    
    const seedUsers = require('./utils/seedUsers');
    await seedUsers();
  }

  // Listen on httpServer (not app) so Socket.io shares the same port
  httpServer.listen(PORT, () => {
    console.log('');
    console.log('════════════════════════════════════════════');
    console.log('  🏥 Zero-Wait OPD Kiosk — API Server');
    console.log('════════════════════════════════════════════');
    console.log(`  🌐 Server:    http://localhost:${PORT}`);
    console.log(`  💊 Health:    http://localhost:${PORT}/api/health`);
    console.log(`  🗄️  Database:  ${dbConnected ? 'MongoDB Connected ✅' : 'Not connected ⚠️ (using fallbacks)'}`);
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    console.log(`  🤖 Gemini AI: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_key_here' ? `Configured ✅ (${geminiModel})` : 'Not configured ⚠️ (using fallbacks)'}`);
    console.log(`  🎙️  OpenAI Realtime: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'}`);
    console.log(`  🔌 Socket.io: Real-time alerts enabled ✅`);
    console.log('════════════════════════════════════════════');
    console.log('');
  });
};

startServer();
