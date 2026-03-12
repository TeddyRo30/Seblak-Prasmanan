// src/services/userService.js
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Get all users (Admin)
 */
const getAllUsers = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, role, search, isActive } = options;

    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ]
      })
    };

    const users = await prisma.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true }
        }
      }
    });

    const total = await prisma.user.count({ where });

    return {
      data: users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID (Admin)
 */
const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        addresses: true,
        activityLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!user) {
      throw {
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      };
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile (Admin)
 */
const updateUserProfile = async (userId, data) => {
  try {
    const { fullName, phone, email } = data;

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

    // Check if new email already exists (if changing email)
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw {
          status: 409,
          code: 'EMAIL_EXISTS',
          message: 'Email already in use'
        };
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(email && { email })
      },
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

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user role (Admin)
 */
const changeUserRole = async (userId, newRole) => {
  try {
    const validRoles = ['customer', 'admin', 'kitchen_staff', 'driver'];

    if (!validRoles.includes(newRole)) {
      throw {
        status: 400,
        code: 'INVALID_ROLE',
        message: `Role must be one of: ${validRoles.join(', ')}`
      };
    }

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

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Activate/Deactivate user (Admin)
 */
const toggleUserActive = async (userId, isActive) => {
  try {
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

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        updatedAt: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset user password (Admin)
 */
const resetUserPassword = async (userId, newPassword) => {
  try {
    if (!newPassword || newPassword.length < 6) {
      throw {
        status: 400,
        code: 'INVALID_PASSWORD',
        message: 'Password must be at least 6 characters'
      };
    }

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

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(newPassword, salt);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
        email: true,
        fullName: true,
        updatedAt: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user (Admin)
 */
const deleteUser = async (userId) => {
  try {
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

    // Check if user has active orders
    const activeOrders = await prisma.order.count({
      where: {
        customerId: userId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    });

    if (activeOrders > 0) {
      throw {
        status: 400,
        code: 'CANNOT_DELETE',
        message: `User has ${activeOrders} active orders. Complete or cancel them first.`
      };
    }

    // Soft delete or hard delete
    const deleted = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }, // Soft delete
      select: {
        id: true,
        email: true,
        fullName: true
      }
    });

    return deleted;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user statistics (Admin)
 */
const getUserStatistics = async () => {
  try {
    // Total users
    const totalUsers = await prisma.user.count();

    // Active users
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: { isActive: true }
    });

    // New users today
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const newUsersToday = await prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });

    // New users this month
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart
        }
      }
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersToday,
      newUsersThisMonth,
      byRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count
      }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get user activity summary
 */
const getUserActivitySummary = async (userId) => {
  try {
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

    // Total orders
    const totalOrders = await prisma.order.count({
      where: { customerId: userId }
    });

    // Total spent
    const spendingData = await prisma.order.aggregate({
      where: { customerId: userId },
      _sum: { total: true }
    });
    const totalSpent = spendingData._sum.total || 0;

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { customerId: userId },
      _count: true
    });

    // Last order
    const lastOrder = await prisma.order.findFirst({
      where: { customerId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true
      }
    });

    return {
      totalOrders,
      totalSpent,
      avgOrderValue: totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0,
      ordersByStatus,
      lastOrder,
      joinDate: user.createdAt,
      lastActive: user.updatedAt
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserRole,
  toggleUserActive,
  resetUserPassword,
  deleteUser,
  getUserStatistics,
  getUserActivitySummary
};