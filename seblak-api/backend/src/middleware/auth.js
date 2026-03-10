// src/middleware/auth.js
import authService from '../services/authService.js';

/**
 * Middleware untuk verify JWT token
 * Gunakan di protected routes
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token dari header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw {
        status: 401,
        code: 'MISSING_TOKEN',
        message: 'Authorization token is required'
      };
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = authService.verifyToken(token, false);

    // Attach user info ke request
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware untuk check user role
 * Gunakan: authorize('admin', 'kitchen_staff')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw {
          status: 401,
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        };
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw {
          status: 403,
          code: 'FORBIDDEN',
          message: `This action requires one of these roles: ${allowedRoles.join(', ')}`
        };
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { authenticate, authorize };