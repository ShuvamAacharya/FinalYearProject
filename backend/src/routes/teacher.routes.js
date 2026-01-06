import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { teacherDashboard } from "../controllers/teacherController.js";

const router = express.Router();

// Teacher-only route
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("teacher", "admin"), // admin optional
  teacherDashboard
);

export default router;
