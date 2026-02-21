import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db.js';
import startScheduler from './lib/scheduler.js';

// Route imports
import authRoutes from './routes/auth.js';
import recruitmentRoutes from './routes/recruitment.js';
import eventsRoutes from './routes/events.js';
import examRoutes from './routes/exam.js';
import teamRoutes from './routes/team.js';
import userRoutes from './routes/user.js';
import configRoutes from './routes/config.js';
import shareRoutes from './routes/share.js';
import galleryRoutes from './routes/gallery.js';
import adminUsersRoutes from './routes/adminUsers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recruit', recruitmentRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/config', configRoutes);
app.use('/api/user', userRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/share', shareRoutes); // Social Share Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ping endpoint for cron jobs
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Connect to DB and start server
connectDB().then(() => {
  startScheduler();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
