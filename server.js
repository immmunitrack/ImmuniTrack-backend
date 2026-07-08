const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const childRoutes = require('./routes/childRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const immunisationRoutes = require('./routes/immunisationRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5050;
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

// CORS allows the React app, which runs on another port during development,
// to call this API from the browser. localhost and 127.0.0.1 are different
// browser origins, so the local defaults allow both.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);

// These middleware functions parse JSON and form bodies before routes read req.body.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health checks are useful for confirming both Express and the database are reachable.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'unavailable', error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/immunisations', immunisationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/health-facilities', facilityRoutes);
app.use('/api/admin', adminRoutes);

// Any request that reached this point did not match a defined route.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler. Multer upload errors and normal server errors are returned as JSON.
app.use((error, req, res, next) => {
  if (error.name === 'MulterError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.message && error.message.includes('Only PDF')) {
    return res.status(400).json({ message: error.message });
  }
  res.status(500).json({ message: 'Server error', error: error.message });
});

// Start the HTTP server after all middleware and routes have been registered.
app.listen(PORT, () => {
  console.log(`ImmuniTrack API running on port ${PORT}`);
});
