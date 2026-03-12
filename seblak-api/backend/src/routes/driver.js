// src/routes/driver.js
import express from 'express';
import driverController from '../controllers/driverController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * ===== ADMIN DRIVER MANAGEMENT ROUTES =====
 */

// GET /api/v1/admin/drivers/stats
// Get all drivers statistics
router.get(
  '/drivers/stats',
  authenticate,
  authorize('admin'),
  driverController.getAllDriversStatistics
);

// GET /api/v1/admin/drivers/available
// Get available drivers
router.get(
  '/drivers/available',
  authenticate,
  authorize('admin'),
  driverController.getAvailableDrivers
);

// GET /api/v1/admin/drivers
// Get all drivers
router.get(
  '/drivers',
  authenticate,
  authorize('admin'),
  driverController.getAllDrivers
);

// POST /api/v1/admin/drivers
// Create new driver
router.post(
  '/drivers',
  authenticate,
  authorize('admin'),
  driverController.createDriver
);

// GET /api/v1/admin/drivers/:driverId
// Get driver detail
router.get(
  '/drivers/:driverId',
  authenticate,
  authorize('admin'),
  driverController.getDriverDetail
);

// PATCH /api/v1/admin/drivers/:driverId/profile
// Update driver profile
router.patch(
  '/drivers/:driverId/profile',
  authenticate,
  authorize('admin'),
  driverController.updateDriverProfile
);

// DELETE /api/v1/admin/drivers/:driverId
// Delete driver
router.delete(
  '/drivers/:driverId',
  authenticate,
  authorize('admin'),
  driverController.deleteDriver
);

/**
 * ===== DRIVER & CUSTOMER ROUTES (Protected) =====
 */

// PATCH /api/v1/drivers/:driverId/location
// Update driver location (Driver self-update)
router.patch(
  '/drivers/:driverId/location',
  authenticate,
  driverController.updateDriverLocation
);

// PATCH /api/v1/drivers/:driverId/status
// Update driver status
router.patch(
  '/drivers/:driverId/status',
  authenticate,
  driverController.updateDriverStatus
);

// GET /api/v1/drivers/:driverId/stats
// Get driver statistics (public)
router.get(
  '/drivers/:driverId/stats',
  driverController.getDriverStatistics
);

// POST /api/v1/drivers/:driverId/ratings
// Add driver rating (Customer)
router.post(
  '/drivers/:driverId/ratings',
  authenticate,
  driverController.addDriverRating
);

export default router;