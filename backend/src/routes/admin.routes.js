import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createTeacher } from "../controllers/adminController.js";

const router = express.Router();

router.post(
  "/create-teacher",
  protect,
  authorizeRoles("admin"),
  createTeacher
);

export default router;
