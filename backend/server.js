import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';  // ← Critical: add /src/
import app from './src/app.js';              // ← Critical: add /src/

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});