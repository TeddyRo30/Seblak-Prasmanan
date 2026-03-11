// src/routes/payment.js
import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * ===== PUBLIC ROUTES =====
 */

// GET /api/v1/payment-methods
// Get available payment methods
router.get('/payment-methods', paymentController.getPaymentMethods);

/**
 * ===== CUSTOMER ROUTES (Protected) =====
 */

// POST /api/v1/orders/:orderId/payment
// Create payment for order
router.post('/orders/:orderId/payment', authenticate, paymentController.createPayment);

// GET /api/v1/orders/:orderId/payment
// Get payment for order
router.get('/orders/:orderId/payment', authenticate, paymentController.getPaymentByOrder);

/**
 * ===== WEBHOOK ROUTES (No auth needed) =====
 */

// POST /api/v1/webhooks/payment/midtrans
// Midtrans webhook
router.post('/webhooks/payment/midtrans', paymentController.handleMidtransWebhook);

// POST /api/v1/webhooks/payment/ipaymu
// iPaymu webhook
router.post('/webhooks/payment/ipaymu', paymentController.handleIpaymuWebhook);

/**
 * ===== ADMIN ROUTES (Protected) =====
 */

// GET /api/v1/admin/payments
// Get all payments (Admin)
router.get('/admin/all', authenticate, authorize('admin'), paymentController.getAllPayments);

// PATCH /api/v1/payments/:paymentId/confirm
// Confirm payment (Admin)
router.patch('/admin/:paymentId/confirm', authenticate, authorize('admin'), paymentController.confirmPayment);

// GET /api/v1/admin/payment-stats
// Get payment statistics (Admin)
router.get('/admin/stats', authenticate, authorize('admin'), paymentController.getPaymentStats);

// PATCH /api/v1/admin/payments/:paymentId/refund
// Refund payment (Admin)
router.patch('/admin/:paymentId/refund', authenticate, authorize('admin'), paymentController.refundPayment);

export default router;