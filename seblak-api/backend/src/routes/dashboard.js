// src/routes/dashboard.js
import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import advancedOrderController from '../controllers/advancedOrderController.js';

const router = express.Router();

/**
 * ===== ADMIN DASHBOARD ROUTES (Protected - Admin only) =====
 */

// GET /api/v1/admin/dashboard
// Get complete dashboard data
router.get(
  '/dashboard',
  authenticate,
  authorize('admin'),
  dashboardController.getDashboard
);

// GET /api/v1/admin/dashboard/metrics
// Get dashboard metrics
router.get(
  '/dashboard/metrics',
  authenticate,
  authorize('admin'),
  dashboardController.getMetrics
);

// GET /api/v1/admin/dashboard/orders
// Get orders overview
router.get(
  '/dashboard/orders',
  authenticate,
  authorize('admin'),
  dashboardController.getOrdersOverview
);

// GET /api/v1/admin/dashboard/revenue
// Get revenue by date range
router.get(
  '/dashboard/revenue',
  authenticate,
  authorize('admin'),
  dashboardController.getRevenue
);

// GET /api/v1/admin/dashboard/top-items
// Get top selling items
router.get(
  '/dashboard/top-items',
  authenticate,
  authorize('admin'),
  dashboardController.getTopItems
);

// GET /api/v1/admin/dashboard/payment-methods
// Get payment methods distribution
router.get(
  '/dashboard/payment-methods',
  authenticate,
  authorize('admin'),
  dashboardController.getPaymentMethods
);

// GET /api/v1/admin/dashboard/order-status
// Get order status distribution
router.get(
  '/dashboard/order-status',
  authenticate,
  authorize('admin'),
  dashboardController.getOrderStatus
);

// GET /api/v1/admin/dashboard/low-stock
// Get low stock alerts
router.get(
  '/dashboard/low-stock',
  authenticate,
  authorize('admin'),
  dashboardController.getLowStock
);

// GET /api/v1/admin/dashboard/customers
// Get customer summary
router.get(
  '/dashboard/customers',
  authenticate,
  authorize('admin'),
  dashboardController.getCustomerSummary
);

// GET /api/v1/admin/orders/cancellation-reasons
router.get(
  '/orders/cancellation-reasons',
  authenticate,
  authorize('admin'),
  advancedOrderController.getCancellationReasons
);

export default router;