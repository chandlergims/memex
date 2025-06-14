const { createServer } = require('http');
const { parse } = require('url');
const nextjs = require('next');
const fetch = require('node-fetch');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const PORT = process.env.PORT || 3000;
const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY || 'your-secret-key-for-cron-job-security';

// Note: Cron job is now handled by Railway's built-in cron feature
// See railway.toml for the cron job configuration

// Create a socket.io instance that can be accessed from API routes
let io;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  // Initialize Socket.IO
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Make io accessible globally
  global.io = io;
  console.log('WebSocket server set to global.io:', global.io ? 'Success' : 'Failed');
  
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log('> WebSocket server initialized');
    
    // Cron job is now handled by Railway
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});

// Export a function to get the io instance
module.exports = {
  getIO: () => io
};
