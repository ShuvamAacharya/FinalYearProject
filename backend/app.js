import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';  // ← .js extension required

const app = express();

// CORS configuration - allow frontend on port 5173
app.use(
  cors({
    origin: 'http://localhost:5173',  // Vite default port
    credentials: true,                // Allow cookies to be sent
  })
);

// Body parsers
app.use(express.json());           // for parsing application/json
app.use(express.urlencoded({ extended: true })); // optional, for form data

// Cookie parser
app.use(cookieParser());

// Mount API routes
app.use('/api/auth', authRoutes);

// Simple health check route (optional but useful)
app.get('/api', (req, res) => {
  res.json({ message: 'EduCity Backend API is running!' });
});

// Root route for quick testing
app.get('/', (req, res) => {
  res.send('EduCity Backend is Running! 🚀');
});

export default app;