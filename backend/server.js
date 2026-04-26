const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://issue-tracker-gamma-inky.vercel.app"
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('socketio', io);

// MongoDB Connection logic
console.log('MONGO_URI:', process.env.MONGO_URI);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Register Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.send('API running');
});

// ... rest handled by global error handler

// Global Error Handler for JSON responses
app.use((err, req, res, next) => {
  console.error('Error detail:', err);
  
  let status = err.status || 500;
  let message = err.message || 'An internal server error occurred';

  // Handle Multer specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File too large. Maximum limit is 10MB.';
  } else if (err.name === 'MulterError') {
    status = 400;
  }

  res.status(status).json({
    status: 'error',
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('MongoDB Connected');
  });
}).catch(err => {
  console.error('Failed to start server due to DB connection error:', err);
});
