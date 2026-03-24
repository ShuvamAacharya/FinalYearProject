import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { teacherDashboard } from "../controllers/teacher.controller.js";

const router = express.Router();

// Teacher-only route
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  teacherDashboard
);

export default router;
