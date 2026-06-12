import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Route imports
import adminRoutes from './src/routes/adminRoutes.js';
import assessmentRoutes from './src/routes/assessmentRoutes.js';
import questionRoutes from './src/routes/questionRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import submissionRoutes from './src/routes/submissionRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- STATIC FILES -------------------- */

// Serve uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')));

/* -------------------- ROUTES -------------------- */

app.use('/api/admin', adminRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);

/* -------------------- ROOT ROUTE (FIX) -------------------- */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Evalora API is running 🚀',
    health: '/api/health'
  });
});

/* -------------------- HEALTH CHECK -------------------- */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* -------------------- 404 HANDLER -------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

/* -------------------- ERROR HANDLER -------------------- */

app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Evalora server running on port ${PORT}`);
  console.log(`📍 Health check: /api/health`);
});