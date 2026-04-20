import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/authRoutes.js';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import Certificate from './models/Certificate.js';

configurePassport();
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/certificates', express.static('certificates'));
// Routes
app.use('/api/student', studentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student/certificates', certificateRoutes);

// Public certificate verification (no auth required)
app.get('/api/certificates/verify/:certNumber', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateNumber: req.params.certNumber })
      .populate('student', 'name')
      .populate('course', 'title');
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }
    res.json({ success: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: ' Educity API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      student: '/api/student',
      teacher: '/api/teacher',
      admin: '/api/admin',
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;