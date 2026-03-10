// src/routes/auth.js
import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public routes
 */

// POST /api/v1/auth/register
router.post('/register', authController.register);

// POST /api/v1/auth/login
router.post('/login', authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

/**
 * Protected routes (require authentication)
 */

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getMe);

// POST /api/v1/auth/change-password
router.post('/change-password', authenticate, authController.changePassword);

export default router;