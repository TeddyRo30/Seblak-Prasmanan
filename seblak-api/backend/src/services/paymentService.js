// src/services/paymentService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create payment record
 */
const createPayment = async (orderId, data) => {
  try {
    const { paymentMethod, amount } = data;

    // Validate input
    if (!orderId || !paymentMethod || !amount) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'orderId, paymentMethod, and amount are required'
      };
    }

    // Check order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw {
        status: 404,
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      };
    }

    // Validate amount matches order total
    if (parseInt(amount) !== order.total) {
      throw {
        status: 400,
        code: 'AMOUNT_MISMATCH',
        message: `Payment amount (${amount}) does not match order total (${order.total})`
      };
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (existingPayment) {
      throw {
        status: 409,
        code: 'PAYMENT_EXISTS',
        message: 'Payment already exists for this order'
      };
    }

    // Determine gateway based on payment method
    let gateway = 'NONE';
    if (paymentMethod === 'ONLINE') {
      gateway = 'MIDTRANS'; // Default to Midtrans for online payments
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        paymentMethod,
        gateway,
        amount: parseInt(amount),
        status: paymentMethod === 'CASH' ? 'CONFIRMED' : 'PENDING'
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true
          }
        }
      }
    });

    return payment;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment by order ID
 */
const getPaymentByOrderId = async (orderId) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true
          }
        },
        transactions: true
      }
    });

    if (!payment) {
      throw {
        status: 404,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found'
      };
    }

    return payment;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment by ID
 */
const getPaymentById = async (paymentId) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        transactions: true
      }
    });

    if (!payment) {
      throw {
        status: 404,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found'
      };
    }

    return payment;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm payment (Manual confirmation for CASH/TRANSFER)
 */
const confirmPayment = async (paymentId, data = {}) => {
  try {
    const { transactionId, referenceId, notes } = data;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw {
        status: 404,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found'
      };
    }

    if (payment.status === 'CONFIRMED') {
      throw {
        status: 400,
        code: 'PAYMENT_ALREADY_CONFIRMED',
        message: 'Payment is already confirmed'
      };
    }

    // Update payment status
    const confirmed = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CONFIRMED',
        transactionId: transactionId || null,
        referenceId: referenceId || null,
        notes: notes || null,
        confirmedAt: new Date()
      },
      include: {
        order: true,
        transactions: true
      }
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'CONFIRMED' }
    });

    return confirmed;
  } catch (error) {
    throw error;
  }
};

/**
 * Handle payment webhook (from Midtrans, iPaymu, etc)
 */
const handlePaymentWebhook = async (data) => {
  try {
    const { orderId, transactionId, status, gateway, amount, signature } = data;

    // Validate webhook signature (basic validation)
    // In production, validate proper signature from payment gateway

    const payment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (!payment) {
      throw {
        status: 404,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found'
      };
    }

    // Map gateway status to our status
    let paymentStatus = 'PENDING';
    if (status === 'settlement' || status === 'paid' || status === 'success') {
      paymentStatus = 'CONFIRMED';
    } else if (status === 'failed' || status === 'error') {
      paymentStatus = 'FAILED';
    }

    // Update payment
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId,
        gateway
      }
    });

    // Create transaction record
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        gateway: gateway || 'MIDTRANS',
        transactionId,
        status: paymentStatus,
        amount: parseInt(amount),
        responseData: data
      }
    });

    // Update order payment status
    if (paymentStatus === 'CONFIRMED') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'CONFIRMED' }
      });
    }

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment methods
 */
const getPaymentMethods = () => {
  return [
    {
      id: 'CASH',
      name: 'Cash',
      description: 'Pay at store/delivery'
    },
    {
      id: 'QRIS',
      name: 'QRIS',
      description: 'Scan QRIS code'
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Bank Transfer',
      description: 'Transfer ke rekening bank'
    },
    {
      id: 'ONLINE',
      name: 'Online Payment',
      description: 'Credit card, e-wallet via Midtrans'
    }
  ];
};

/**
 * Get payment statistics (Admin)
 */
const getPaymentStats = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const where = {
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        ...where,
        status: 'CONFIRMED'
      },
      _sum: { amount: true }
    });

    // Count by method
    const byMethod = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: { ...where, status: 'CONFIRMED' },
      _count: true,
      _sum: { amount: true }
    });

    // Count by status
    const byStatus = await prisma.payment.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      byMethod,
      byStatus,
      totalTransactions: (await prisma.payment.count({ where }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Refund payment
 */
const refundPayment = async (paymentId, reason = null) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw {
        status: 404,
        code: 'PAYMENT_NOT_FOUND',
        message: 'Payment not found'
      };
    }

    if (payment.status !== 'CONFIRMED') {
      throw {
        status: 400,
        code: 'CANNOT_REFUND',
        message: 'Only confirmed payments can be refunded'
      };
    }

    // Update payment status
    const refunded = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        notes: reason || 'Refund requested'
      }
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'FAILED' }
    });

    return refunded;
  } catch (error) {
    throw error;
  }
};

export default {
  createPayment,
  getPaymentByOrderId,
  getPaymentById,
  confirmPayment,
  handlePaymentWebhook,
  getPaymentMethods,
  getPaymentStats,
  refundPayment
};