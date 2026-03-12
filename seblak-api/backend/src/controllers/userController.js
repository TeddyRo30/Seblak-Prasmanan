// src/controllers/userController.js
import userService from '../services/userService.js';

/**
 * GET /api/v1/admin/users
 * Get all users (Admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, role, search, isActive } = req.query;

    const result = await userService.getAllUsers({
      limit: parseInt(limit),
      offset: parseInt(offset),
      role,
      search,
      isActive: isActive ? isActive === 'true' : undefined
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Users retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:userId
 * Get user detail (Admin)
 */
const getUserDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/profile
 * Update user profile (Admin)
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { fullName, phone, email } = req.body;

    const user = await userService.updateUserProfile(userId, {
      fullName,
      phone,
      email
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User profile updated successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/role
 * Change user role (Admin)
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Role is required'
      };
    }

    const user = await userService.changeUserRole(userId, role);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User role changed successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/toggle-active
 * Activate/Deactivate user (Admin)
 */
const toggleUserActive = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'isActive is required (true or false)'
      };
    }

    const user = await userService.toggleUserActive(userId, isActive);

    res.status(200).json({
      success: true,
      status: 200,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/users/:userId/reset-password
 * Reset user password (Admin)
 */
const resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'newPassword is required'
      };
    }

    const user = await userService.resetUserPassword(userId, newPassword);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User password reset successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/users/:userId
 * Delete user (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await userService.deleteUser(userId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User deleted successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/stats
 * Get user statistics (Admin)
 */
const getUserStatistics = async (req, res, next) => {
  try {
    const stats = await userService.getUserStatistics();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:userId/activity
 * Get user activity summary (Admin)
 */
const getUserActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const activity = await userService.getUserActivitySummary(userId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User activity retrieved successfully',
      data: activity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUserDetail,
  updateUserProfile,
  changeUserRole,
  toggleUserActive,
  resetUserPassword,
  deleteUser,
  getUserStatistics,
  getUserActivity
};