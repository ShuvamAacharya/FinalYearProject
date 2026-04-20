import express from 'express';
import { login, register, logout, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import passport from '../config/passport.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/login?error=oauth_failed',
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const role = req.user.role;
    res.redirect(`http://localhost:5173/oauth-success?token=${token}&role=${role}`);
  }
);

export default router;