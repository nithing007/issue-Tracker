const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    process.exit(1);
  }
};

connectDB().then(() => console.log("Connected to DB"));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

app.get('/', (req, res) => {
  res.send('API running');
});

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
