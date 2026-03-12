// src/controllers/driverController.js
import driverService from '../services/driverService.js';

/**
 * GET /api/v1/admin/drivers
 * Get all drivers (Admin)
 */
const getAllDrivers = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status, search } = req.query;

    const result = await driverService.getAllDrivers({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      search
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Drivers retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/drivers/available
 * Get available drivers for assignment
 */
const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAvailableDrivers();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Available drivers retrieved successfully',
      data: drivers,
      count: drivers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/drivers/stats
 * Get all drivers statistics
 */
const getAllDriversStatistics = async (req, res, next) => {
  try {
    const stats = await driverService.getAllDriversStatistics();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/drivers/:driverId
 * Get driver detail
 */
const getDriverDetail = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const driver = await driverService.getDriverById(driverId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver retrieved successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/drivers
 * Create new driver (Admin)
 */
const createDriver = async (req, res, next) => {
  try {
    const { fullName, email, phone, vehicleType, vehicleLicense, password } = req.body;

    const driver = await driverService.createDriver({
      fullName,
      email,
      phone,
      vehicleType,
      vehicleLicense,
      password
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Driver created successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/drivers/:driverId/profile
 * Update driver profile
 */
const updateDriverProfile = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { fullName, phone, vehicleType, vehicleLicense } = req.body;

    const driver = await driverService.updateDriverProfile(driverId, {
      fullName,
      phone,
      vehicleType,
      vehicleLicense
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver profile updated successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/:driverId/location
 * Update driver location (Driver self-update)
 */
const updateDriverLocation = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { latitude, longitude } = req.body;

    // Verify ownership (driver can only update own location)
    if (req.user.sub !== driverId && req.user.role !== 'admin') {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own location'
      };
    }

    const driver = await driverService.updateDriverLocation(
      driverId,
      latitude,
      longitude
    );

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver location updated successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/:driverId/status
 * Update driver status (online/offline/busy)
 */
const updateDriverStatus = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body;

    // Verify ownership (driver can only update own status)
    if (req.user.sub !== driverId && req.user.role !== 'admin') {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You can only update your own status'
      };
    }

    if (!status) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Status is required'
      };
    }

    const driver = await driverService.updateDriverStatus(driverId, status);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver status updated successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/:driverId/stats
 * Get driver statistics
 */
const getDriverStatistics = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const stats = await driverService.getDriverStatistics(driverId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/drivers/:driverId/ratings
 * Add driver rating (Customer)
 */
const addDriverRating = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { driverId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Rating is required'
      };
    }

    const newRating = await driverService.addDriverRating(
      driverId,
      customerId,
      parseInt(rating),
      comment
    );

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Driver rating added successfully',
      data: newRating,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/admin/drivers/:driverId
 * Delete driver (Admin)
 */
const deleteDriver = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const driver = await driverService.deleteDriver(driverId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver deleted successfully',
      data: driver,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllDrivers,
  getAvailableDrivers,
  getAllDriversStatistics,
  getDriverDetail,
  createDriver,
  updateDriverProfile,
  updateDriverLocation,
  updateDriverStatus,
  getDriverStatistics,
  addDriverRating,
  deleteDriver
};