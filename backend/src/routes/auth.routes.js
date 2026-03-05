import express from "express";
import { login, register, logout, getMe } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
