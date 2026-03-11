// src/controllers/paymentController.js
import paymentService from '../services/paymentService.js';

/**
 * POST /api/v1/orders/:orderId/payment
 * Create payment for order
 */
const createPayment = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { orderId } = req.params;
    const { paymentMethod, amount } = req.body;

    // Verify order ownership
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    await prisma.$disconnect();

    if (!order) {
      throw {
        status: 404,
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      };
    }

    if (order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to create payment for this order'
      };
    }

    const payment = await paymentService.createPayment(orderId, {
      paymentMethod,
      amount: amount || order.total
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Payment created successfully',
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:orderId/payment
 * Get payment for order
 */
const getPaymentByOrder = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { orderId } = req.params;

    // Verify order ownership
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    await prisma.$disconnect();

    if (!order || order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this payment'
      };
    }

    const payment = await paymentService.getPaymentByOrderId(orderId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payment retrieved successfully',
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/payments/:paymentId/confirm
 * Confirm payment (Admin)
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { transactionId, referenceId, notes } = req.body;

    const payment = await paymentService.confirmPayment(paymentId, {
      transactionId,
      referenceId,
      notes
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payment confirmed successfully',
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/payment-methods
 * Get available payment methods
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    const methods = paymentService.getPaymentMethods();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payment methods retrieved',
      data: methods,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/webhooks/payment/midtrans
 * Handle Midtrans webhook
 */
const handleMidtransWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;

    // Validate webhook (in production, validate signature)
    // For now, basic validation

    // Map Midtrans status
    const midtransStatusMap = {
      settlement: 'CONFIRMED',
      pending: 'PENDING',
      deny: 'FAILED',
      expire: 'FAILED',
      cancel: 'FAILED'
    };

    const paymentData = {
      transactionId: webhookData.transaction_id,
      orderId: webhookData.order_id,
      status: webhookData.transaction_status,
      gateway: 'MIDTRANS',
      amount: webhookData.gross_amount,
      signature: webhookData.signature_key
    };

    await paymentService.handlePaymentWebhook(paymentData);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * POST /api/v1/webhooks/payment/ipaymu
 * Handle iPaymu webhook
 */
const handleIpaymuWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;

    const paymentData = {
      transactionId: webhookData.invoice,
      orderId: webhookData.order_id,
      status: webhookData.status,
      gateway: 'IPAYMU',
      amount: webhookData.amount,
      signature: webhookData.signature
    };

    await paymentService.handlePaymentWebhook(paymentData);

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * GET /api/v1/admin/payments
 * Get all payments (Admin)
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const where = {
      ...(status && { status })
    };

    const payments = await prisma.payment.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            customer: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    const total = await prisma.payment.count({ where });
    await prisma.$disconnect();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payments retrieved successfully',
      data: payments,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/payment-stats
 * Get payment statistics (Admin)
 */
const getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await paymentService.getPaymentStats({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payment statistics retrieved',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/payments/:paymentId/refund
 * Refund payment (Admin)
 */
const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await paymentService.refundPayment(paymentId, reason);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payment refunded successfully',
      data: payment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPayment,
  getPaymentByOrder,
  confirmPayment,
  getPaymentMethods,
  handleMidtransWebhook,
  handleIpaymuWebhook,
  getAllPayments,
  getPaymentStats,
  refundPayment
};