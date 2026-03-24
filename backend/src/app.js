import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EduCity Backend is Running!",
  });
});

export default app;