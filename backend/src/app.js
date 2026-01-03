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

// module.exports = app;


const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if needed for uploads)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// API Routes - All API endpoints under /api/*
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const certificateRoutes = require("./routes/certificate.routes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/certificates", certificateRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EduCity API is running" });
});

// Root route - API info (frontend is served by Vite dev server)
app.get("/", (req, res) => {
  res.json({ 
    message: "EduCity API", 
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      courses: "/api/courses",
      certificates: "/api/certificates"
    }
  });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

module.exports = app;
