// src/routes/user.js
import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * ===== ADMIN USER MANAGEMENT ROUTES =====
 */

// GET /api/v1/admin/users
// Get all users
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  userController.getAllUsers
);

// GET /api/v1/admin/users/stats
// Get user statistics
router.get(
  '/users/stats',
  authenticate,
  authorize('admin'),
  userController.getUserStatistics
);

// GET /api/v1/admin/users/:userId
// Get user detail
router.get(
  '/users/:userId',
  authenticate,
  authorize('admin'),
  userController.getUserDetail
);

// GET /api/v1/admin/users/:userId/activity
// Get user activity
router.get(
  '/users/:userId/activity',
  authenticate,
  authorize('admin'),
  userController.getUserActivity
);

// PATCH /api/v1/admin/users/:userId/profile
// Update user profile
router.patch(
  '/users/:userId/profile',
  authenticate,
  authorize('admin'),
  userController.updateUserProfile
);

// PATCH /api/v1/admin/users/:userId/role
// Change user role
router.patch(
  '/users/:userId/role',
  authenticate,
  authorize('admin'),
  userController.changeUserRole
);

// PATCH /api/v1/admin/users/:userId/toggle-active
// Activate/Deactivate user
router.patch(
  '/users/:userId/toggle-active',
  authenticate,
  authorize('admin'),
  userController.toggleUserActive
);

// POST /api/v1/admin/users/:userId/reset-password
// Reset user password
router.post(
  '/users/:userId/reset-password',
  authenticate,
  authorize('admin'),
  userController.resetUserPassword
);

// DELETE /api/v1/admin/users/:userId
// Delete user
router.delete(
  '/users/:userId',
  authenticate,
  authorize('admin'),
  userController.deleteUser
);

export default router;