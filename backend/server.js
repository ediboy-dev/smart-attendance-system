require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const registrationRoutes = require('./routes/registration');
const sessionRoutes = require('./routes/sessions');
const attendanceRoutes = require('./routes/attendance');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Health check — visit http://localhost:5000/api/health to confirm the server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Attendance system backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// When hosted online, the same server also delivers the React pages (built into frontend/dist),
// so the whole system has one web address. On the laptop, Vite serves the pages as before.
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));
}

const PORT = process.env.PORT || 5000;

// Keep the server running when the internet drops for a moment.
// The database driver reconnects by itself once the connection returns.
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected - waiting to reconnect...'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled error (server kept running):', err && err.message ? err.message : err);
});
process.on('uncaughtException', (err) => {
  if (err && /^Mongo/.test(err.name || '')) {
    console.error('Database connection error (server kept running):', err.message);
    return;
  }
  console.error(err);
  process.exit(1);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
