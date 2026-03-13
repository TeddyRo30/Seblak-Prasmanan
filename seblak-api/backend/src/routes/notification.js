// src/routes/notification.js
import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * ===== NOTIFICATION ROUTES (Protected) =====
 */

// GET /api/v1/notifications
// Get user notifications
router.get(
  '/',
  authenticate,
  notificationController.getUserNotifications
);

// GET /api/v1/notifications/unread-count
// Get unread count
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

// PATCH /api/v1/notifications/:notificationId/read
// Mark notification as read
router.patch(
  '/:notificationId/read',
  authenticate,
  notificationController.markNotificationAsRead
);

// PATCH /api/v1/notifications/read-all
// Mark all as read
router.patch(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead
);

export default router;