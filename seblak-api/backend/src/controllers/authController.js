// src/controllers/authController.js
import authService from '../services/authService.js';

/**
 * POST /auth/register
 * Register user baru
 */
const register = async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body;

    const result = await authService.register({
      email,
      password,
      fullName,
      phone
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'User registered successfully',
      data: result.user,
      tokens: result.tokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({
      email,
      password
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Login successful',
      data: result.user,
      tokens: result.tokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/refresh
 * Refresh access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Token refreshed successfully',
      tokens,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/me
 * Get current user (protected)
 */
const getMe = async (req, res, next) => {
  try {
    // userId dari JWT middleware
    const userId = req.user.sub;

    const user = await authService.getUserById(userId);

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
 * POST /auth/change-password
 * Change password (protected)
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { oldPassword, newPassword } = req.body;

    const result = await authService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      status: 200,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout
 * Logout user (optional - untuk clear tokens di frontend)
 */
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  getMe,
  changePassword,
  logout
};