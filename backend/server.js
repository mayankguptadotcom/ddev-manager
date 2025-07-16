const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const projectRoutes = require('./src/routes/projects');
const configRoutes = require('./src/routes/config');
const databaseRoutes = require('./src/routes/database');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/config', configRoutes);
app.use('/api/database', databaseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ddev-manager-api'
  });
});

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to DDEV Manager'
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Subscribe to project updates
          ws.projectSubscriptions = data.projects || [];
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast function for sending updates to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Make broadcast function available globally
global.broadcast = broadcast;

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 DDEV Manager API running on port ${PORT}`);
  console.log(`📱 WebSocket server running on port ${PORT}`);
  console.log(`🌐 Frontend served from: ${path.join(__dirname, '../frontend/build')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, wss, broadcast };
