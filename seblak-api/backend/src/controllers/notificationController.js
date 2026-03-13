// src/controllers/notificationController.js
import notificationService from '../services/notificationService.js';

/**
 * GET /api/v1/notifications
 * Get user notifications
 */
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { limit = 20, offset = 0, isRead } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      isRead: isRead ? isRead === 'true' : undefined
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Notifications retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Unread count retrieved',
      data: {
        unreadCount: count
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:notificationId/read
 * Mark notification as read
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await notificationService.markNotificationAsRead(notificationId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Notification marked as read',
      data: notification,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const result = await notificationService.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'All notifications marked as read',
      data: {
        updated: result.updated
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead
};