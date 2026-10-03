require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'WayPoint API Backend is running' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Driver sends location update
  socket.on('driver_location_update', (data) => {
    // data should ideally contain { driverId, tripId, lat, lng, timestamp }
    console.log(`[Location Update] Driver ${data.driverId}: ${data.lat}, ${data.lng}`);
    
    // Instantly broadcast the location to all connected dispatchers/clients
    // Optionally, we could restrict this to a specific room if there are many trips
    io.emit('dispatcher_location_update', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Core Engine running on port ${PORT}`);
});
