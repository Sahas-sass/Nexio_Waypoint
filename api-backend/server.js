require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
});

const PORT = process.env.PORT || 3000;

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'WayPoint API Backend is running' });
});

// --- CUSTOM NODEMAILER OTP SYSTEM ---
const nodemailer = require('nodemailer');
const otpStore = new Map(); // Temporarily stores OTPs in memory: email -> { code, expiresAt }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'poojanidanulya@gmail.com',
    pass: process.env.EMAIL_PASS, // E.g., 'your-16-digit-app-password'
  },
});

// 1. Send OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Generate a random 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store it for 5 minutes
  otpStore.set(email, {
    code: otpCode,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  try {
    await transporter.sendMail({
      from: `"Waypoint Dispatch" <${process.env.EMAIL_USER || 'poojanidanulya@gmail.com'}>`,
      to: email,
      subject: 'Your Waypoint Driver Login Code',
      text: `Your 6-digit Waypoint login code is: ${otpCode}\n\nThis code expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #4A3400;">Waypoint Delivery</h2>
          <p>Your secure driver login code is:</p>
          <h1 style="letter-spacing: 5px; color: #E8AA00;">${otpCode}</h1>
          <p style="color: #666; font-size: 12px;">This code expires in 5 minutes.</p>
        </div>
      `,
    });
    console.log(`[OTP] Sent code ${otpCode} to ${email}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('[OTP] Error sending email:', error);
    res.status(500).json({ error: 'Failed to send OTP email. Please check your Gmail App Password.' });
  }
});

// 2. Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
  const { email, token } = req.body;
  
  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ error: 'No OTP requested for this email or it expired.' });
  }
  
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.code === token) {
    otpStore.delete(email);
    // Success! 
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid OTP code.' });
  }
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
