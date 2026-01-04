// const express = require("express");
// const cors = require("cors");

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Test route
// app.get("/", (req, res) => {
//   res.send("EduCity API running");
// });


// app.get("/register", (req, res) => {
//   res.send("EduCity hello running");
// });

// module.exports = app;

// const express = require("express");
// const cors = require("cors");

// const app = express();

// // middleware
// app.use(cors());
// app.use(express.json());

// // routes
// app.use("/api/about", require("./routes/about.routes"));

// module.exports = app;


// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import authRoutes from './routes/authRoutes.js';

// const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// app.use('/api/auth', authRoutes);

// // Later: app.use('/api/users', userRoutes); etc.

// export default app;


import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // Vite frontend
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

// Optional: simple test route
app.get('/', (req, res) => {
  res.send('EduCity Backend is Running!');
});

export default app;