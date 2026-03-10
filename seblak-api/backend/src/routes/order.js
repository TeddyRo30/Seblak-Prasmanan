// src/routes/order.js
import express from 'express';
import orderController from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * ===== CUSTOMER ROUTES (Protected) =====
 */

// POST /api/v1/orders
// Create new order
router.post('/', authenticate, orderController.createOrder);

// GET /api/v1/orders
// Get user's orders
router.get('/', authenticate, orderController.getUserOrders);

// GET /api/v1/orders/:id
// Get order detail
router.get('/:id', authenticate, orderController.getOrderDetail);

// GET /api/v1/orders/:id/tracking
// Get order tracking info
router.get('/:id/tracking', authenticate, orderController.getOrderTracking);

// GET /api/v1/orders/:id/status-history
// Get order status history
router.get('/:id/status-history', authenticate, orderController.getStatusHistory);

// DELETE /api/v1/orders/:id
// Cancel order
router.delete('/:id', authenticate, orderController.cancelOrder);

/**
 * ===== ADMIN ROUTES (Protected) =====
 */

// GET /api/v1/orders/admin/all
// Get all orders (Admin)
router.get('/admin/all', authenticate, authorize('admin', 'kitchen_staff'), orderController.getAllOrders);

// PATCH /api/v1/orders/admin/:id/status
// Update order status (Admin/Kitchen staff)
router.patch('/admin/:id/status', authenticate, authorize('admin', 'kitchen_staff'), orderController.updateOrderStatus);

// PATCH /api/v1/orders/admin/:id/assign-driver
// Assign driver to order (Admin)
router.patch('/admin/:id/assign-driver', authenticate, authorize('admin'), orderController.assignDriver);

export default router;