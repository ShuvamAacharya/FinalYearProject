import app from './app.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();
import { configurePassport } from './config/passport.js';

const PORT = process.env.PORT || 5000;

// Configure passport AFTER dotenv has loaded
configurePassport();

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(` Server running on port ${PORT}`);
  console.log(` http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});