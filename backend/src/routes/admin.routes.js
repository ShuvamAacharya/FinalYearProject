import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import { createTeacher } from "../controllers/admin.controller.js";

const router = express.Router();

router.post(
  "/create-teacher",
  authMiddleware,
  roleMiddleware("admin"),
  createTeacher
);

export default router;
