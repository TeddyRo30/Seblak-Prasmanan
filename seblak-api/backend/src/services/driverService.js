// src/services/driverService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all drivers (Admin)
 */
const getAllDrivers = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, status, search } = options;

    const where = {
      role: 'driver',
      ...(status && { driverStatus: status }),
      ...(search && {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ]
      })
    };

    const drivers = await prisma.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        driverStatus: true,
        currentLat: true,
        currentLng: true,
        vehicleType: true,
        vehicleLicense: true,
        createdAt: true,
        _count: {
          select: { driverOrders: true }
        }
      }
    });

    const total = await prisma.user.count({ where });

    return {
      data: drivers,
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
 * Get driver by ID
 */
const getDriverById = async (driverId) => {
  try {
    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' },
      include: {
        driverOrders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            customer: {
              select: {
                fullName: true,
                phone: true
              }
            },
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        driverRatings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            customer: {
              select: { fullName: true }
            },
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            driverOrders: true,
            driverRatings: true
          }
        }
      }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    return driver;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new driver (Admin)
 */
const createDriver = async (data) => {
  try {
    const { fullName, email, phone, vehicleType, vehicleLicense, password } = data;

    // Validate input
    if (!fullName || !email || !phone || !vehicleType || !vehicleLicense || !password) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'fullName, email, phone, vehicleType, vehicleLicense, and password are required'
      };
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      throw {
        status: 409,
        code: 'EMAIL_EXISTS',
        message: 'Email already registered'
      };
    }

    // Hash password
    const bcryptjs = await import('bcryptjs');
    const salt = await bcryptjs.default.genSalt(10);
    const passwordHash = await bcryptjs.default.hash(password, salt);

    // Create driver
    const driver = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: 'driver',
        isActive: true,
        driverStatus: 'offline',
        vehicleType,
        vehicleLicense,
        currentLat: 0,
        currentLng: 0
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        vehicleLicense: true,
        driverStatus: true,
        createdAt: true
      }
    });

    return driver;
  } catch (error) {
    throw error;
  }
};

/**
 * Update driver profile
 */
const updateDriverProfile = async (driverId, data) => {
  try {
    const { fullName, phone, vehicleType, vehicleLicense } = data;

    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    const updated = await prisma.user.update({
      where: { id: driverId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(vehicleType && { vehicleType }),
        ...(vehicleLicense && { vehicleLicense })
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        vehicleLicense: true,
        updatedAt: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Update driver location
 */
const updateDriverLocation = async (driverId, latitude, longitude) => {
  try {
    if (latitude === undefined || longitude === undefined) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'latitude and longitude are required'
      };
    }

    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    const updated = await prisma.user.update({
      where: { id: driverId },
      data: {
        currentLat: parseFloat(latitude),
        currentLng: parseFloat(longitude)
      },
      select: {
        id: true,
        fullName: true,
        currentLat: true,
        currentLng: true,
        driverStatus: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Update driver status (online/offline/busy)
 */
const updateDriverStatus = async (driverId, status) => {
  try {
    const validStatuses = ['online', 'offline', 'busy'];

    if (!validStatuses.includes(status)) {
      throw {
        status: 400,
        code: 'INVALID_STATUS',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      };
    }

    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    const updated = await prisma.user.update({
      where: { id: driverId },
      data: { driverStatus: status },
      select: {
        id: true,
        fullName: true,
        driverStatus: true,
        updatedAt: true
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Add driver rating
 */
const addDriverRating = async (driverId, customerId, rating, comment = null) => {
  try {
    if (!rating || rating < 1 || rating > 5) {
      throw {
        status: 400,
        code: 'INVALID_RATING',
        message: 'Rating must be between 1 and 5'
      };
    }

    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    // Check if customer has already rated this driver
    const existingRating = await prisma.driverRating.findFirst({
      where: {
        driverId,
        customerId
      }
    });

    if (existingRating) {
      // Update existing rating
      const updated = await prisma.driverRating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          comment
        }
      });
      return updated;
    }

    // Create new rating
    const newRating = await prisma.driverRating.create({
      data: {
        driverId,
        customerId,
        rating,
        comment
      },
      include: {
        customer: {
          select: { fullName: true }
        }
      }
    });

    return newRating;
  } catch (error) {
    throw error;
  }
};

/**
 * Get driver statistics
 */
const getDriverStatistics = async (driverId) => {
  try {
    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    // Total deliveries
    const totalDeliveries = await prisma.order.count({
      where: {
        assignedDriverId: driverId,
        status: 'COMPLETED'
      }
    });

    // Active deliveries
    const activeDeliveries = await prisma.order.count({
      where: {
        assignedDriverId: driverId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    });

    // Average rating
    const ratingData = await prisma.driverRating.aggregate({
      where: { driverId },
      _avg: { rating: true },
      _count: true
    });

    // Total ratings
    const totalRatings = ratingData._count;
    const avgRating = ratingData._avg.rating || 0;

    // Revenue
    const revenueData = await prisma.order.aggregate({
      where: {
        assignedDriverId: driverId,
        status: 'COMPLETED'
      },
      _sum: { total: true }
    });
    const totalRevenue = revenueData._sum.total || 0;

    return {
      totalDeliveries,
      activeDeliveries,
      avgRating: Math.round(avgRating * 100) / 100,
      totalRatings,
      totalRevenue,
      joinDate: driver.createdAt,
      status: driver.driverStatus
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get available drivers for assignment
 */
const getAvailableDrivers = async () => {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: 'driver',
        isActive: true,
        driverStatus: 'online'
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        currentLat: true,
        currentLng: true,
        vehicleType: true,
        driverStatus: true,
        _count: {
          select: {
            driverOrders: {
              where: {
                status: {
                  notIn: ['COMPLETED', 'CANCELLED']
                }
              }
            }
          }
        }
      },
      orderBy: [
        { driverStatus: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return drivers.map(driver => ({
      ...driver,
      activeOrdersCount: driver._count.driverOrders
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get all driver statistics (Admin)
 */
const getAllDriversStatistics = async () => {
  try {
    // Total drivers
    const totalDrivers = await prisma.user.count({
      where: { role: 'driver' }
    });

    // Online drivers
    const onlineDrivers = await prisma.user.count({
      where: {
        role: 'driver',
        driverStatus: 'online'
      }
    });

    // Drivers by status
    const driversByStatus = await prisma.user.groupBy({
      by: ['driverStatus'],
      where: { role: 'driver' },
      _count: true
    });

    // Total deliveries
    const totalDeliveries = await prisma.order.count({
      where: {
        assignedDriverId: {
          not: null
        },
        status: 'COMPLETED'
      }
    });

    // Average driver rating
    const ratingData = await prisma.driverRating.aggregate({
      _avg: { rating: true }
    });

    return {
      totalDrivers,
      onlineDrivers,
      offlineDrivers: totalDrivers - onlineDrivers,
      driversByStatus,
      totalDeliveries,
      avgDriverRating: Math.round((ratingData._avg.rating || 0) * 100) / 100
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete driver (Admin)
 */
const deleteDriver = async (driverId) => {
  try {
    const driver = await prisma.user.findUnique({
      where: { id: driverId, role: 'driver' }
    });

    if (!driver) {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    // Check active deliveries
    const activeDeliveries = await prisma.order.count({
      where: {
        assignedDriverId: driverId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    });

    if (activeDeliveries > 0) {
      throw {
        status: 400,
        code: 'CANNOT_DELETE',
        message: `Driver has ${activeDeliveries} active deliveries`
      };
    }

    // Soft delete
    const deleted = await prisma.user.update({
      where: { id: driverId },
      data: { isActive: false },
      select: {
        id: true,
        fullName: true
      }
    });

    return deleted;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriverProfile,
  updateDriverLocation,
  updateDriverStatus,
  addDriverRating,
  getDriverStatistics,
  getAvailableDrivers,
  getAllDriversStatistics,
  deleteDriver
};