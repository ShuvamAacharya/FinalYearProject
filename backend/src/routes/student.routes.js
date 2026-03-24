import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { studentDashboard } from "../controllers/student.controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("student"),
  studentDashboard
);

export default router;
