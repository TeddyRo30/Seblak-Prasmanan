// src/services/authService.js
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Hash password dengan bcryptjs
 */
const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

/**
 * Compare password dengan hash
 */
const comparePassword = async (password, hash) => {
  return bcryptjs.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (userId, email, role) => {
  const accessToken = jwt.sign(
    {
      sub: userId,
      email: email,
      role: role,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );

  const refreshToken = jwt.sign(
    {
      sub: userId,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Register user baru
 */
const register = async (data) => {
  try {
    const { email, password, fullName, phone } = data;

    // Validate input
    if (!email || !password || !fullName) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Email, password, and fullName are required'
      };
    }

    // Check email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw {
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email already registered'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        role: 'customer', // Default role
        isActive: true
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.email, user.role);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 */
const login = async (data) => {
  try {
    const { email, password } = data;

    // Validate input
    if (!email || !password) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Email and password are required'
      };
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw {
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      };
    }

    // Check if user is active
    if (!user.isActive) {
      throw {
        status: 403,
        code: 'USER_INACTIVE',
        message: 'User account is inactive'
      };
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw {
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user.id, user.email, user.role);

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw {
        status: 400,
        code: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required'
      };
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      throw {
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid token type'
      };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      throw {
        status: 401,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      };
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user.id,
      user.email,
      user.role
    );

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        status: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Refresh token has expired'
      };
    }
    if (error.name === 'JsonWebTokenError') {
      throw {
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token'
      };
    }
    throw error;
  }
};

/**
 * Verify JWT token
 */
const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        status: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired'
      };
    }
    if (error.name === 'JsonWebTokenError') {
      throw {
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      };
    }
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw {
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      };
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    if (!oldPassword || !newPassword) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Old password and new password are required'
      };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw {
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      };
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw {
        status: 401,
        code: 'INVALID_PASSWORD',
        message: 'Current password is incorrect'
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return { message: 'Password changed successfully' };
  } catch (error) {
    throw error;
  }
};

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  register,
  login,
  refreshAccessToken,
  getUserById,
  changePassword
};