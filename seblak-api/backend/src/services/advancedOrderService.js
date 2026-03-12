// src/services/advancedOrderService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add order notes
 */
const addOrderNotes = async (orderId, customerId, notes) => {
  try {
    if (!notes || notes.trim().length === 0) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'Notes cannot be empty'
      };
    }

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

    // Verify ownership
    if (order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this order'
      };
    }

    // Only allow notes update for NEW orders
    if (order.status !== 'NEW') {
      throw {
        status: 400,
        code: 'CANNOT_UPDATE',
        message: 'Can only add notes to NEW orders'
      };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { notes }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Get order timeline
 */
const getOrderTimeline = async (orderId, customerId = null) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'asc' }
        },
        payment: {
          select: {
            status: true,
            confirmedAt: true,
            createdAt: true
          }
        }
      }
    });

    if (!order) {
      throw {
        status: 404,
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      };
    }

    // Check authorization
    if (customerId && order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this order'
      };
    }

    // Build timeline
    const timeline = [
      {
        timestamp: order.createdAt,
        status: 'order_created',
        description: 'Order created',
        icon: '📝'
      }
    ];

    // Add status history
    order.statusHistory.forEach(history => {
      timeline.push({
        timestamp: history.changedAt,
        status: history.newStatus,
        previousStatus: history.previousStatus,
        description: `Status changed to ${history.newStatus}`,
        reason: history.reason,
        icon: getStatusIcon(history.newStatus)
      });
    });

    // Add payment confirmation
    if (order.payment && order.payment.confirmedAt) {
      timeline.push({
        timestamp: order.payment.confirmedAt,
        status: 'payment_confirmed',
        description: 'Payment confirmed',
        icon: '✅'
      });
    }

    // Sort by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return timeline;
  } catch (error) {
    throw error;
  }
};

/**
 * Get status icon helper
 */
const getStatusIcon = (status) => {
  const icons = {
    'NEW': '📋',
    'CONFIRMED': '✅',
    'PREPARING': '👨‍🍳',
    'READY': '🎉',
    'PICKING': '📦',
    'ON_DELIVERY': '🚗',
    'DELIVERED': '🏠',
    'PICKED_UP': '🛍️',
    'COMPLETED': '✨',
    'CANCELLED': '❌'
  };
  return icons[status] || '📌';
};

/**
 * Add item review
 */
const addItemReview = async (orderId, customerId, menuItemId, rating, comment = null) => {
  try {
    if (!rating || rating < 1 || rating > 5) {
      throw {
        status: 400,
        code: 'INVALID_RATING',
        message: 'Rating must be between 1 and 5'
      };
    }

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

    // Verify ownership
    if (order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to review this order'
      };
    }

    // Only allow reviews for completed orders
    if (order.status !== 'COMPLETED') {
      throw {
        status: 400,
        code: 'CANNOT_REVIEW',
        message: 'Can only review completed orders'
      };
    }

    // Check if item is in order
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        menuItemId
      }
    });

    if (!orderItem) {
      throw {
        status: 404,
        code: 'ITEM_NOT_IN_ORDER',
        message: 'Item is not in this order'
      };
    }

    // Check if already reviewed
    const existingReview = await prisma.itemReview.findFirst({
      where: {
        orderId,
        menuItemId,
        customerId
      }
    });

    if (existingReview) {
      // Update existing review
      const updated = await prisma.itemReview.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment
        }
      });
      return updated;
    }

    // Create new review
    const review = await prisma.itemReview.create({
      data: {
        orderId,
        menuItemId,
        customerId,
        rating,
        comment
      },
      include: {
        menuItem: {
          select: { name: true }
        },
        customer: {
          select: { fullName: true }
        }
      }
    });

    return review;
  } catch (error) {
    throw error;
  }
};

/**
 * Get item reviews
 */
const getItemReviews = async (menuItemId, limit = 10) => {
  try {
    const reviews = await prisma.itemReview.findMany({
      where: { menuItemId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    // Calculate average rating
    const ratingData = await prisma.itemReview.aggregate({
      where: { menuItemId },
      _avg: { rating: true },
      _count: true
    });

    return {
      reviews,
      avgRating: Math.round((ratingData._avg.rating || 0) * 100) / 100,
      totalReviews: ratingData._count
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get order summary for export
 */
const getOrderSummary = async (orderId, customerId = null) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            fullName: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            menuItem: {
              select: { name: true, pricePerUnit: true }
            }
          }
        },
        payment: {
          select: {
            status: true,
            paymentMethod: true,
            amount: true
          }
        },
        driver: {
          select: {
            fullName: true,
            phone: true,
            vehicleType: true
          }
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' }
        }
      }
    });

    if (!order) {
      throw {
        status: 404,
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found'
      };
    }

    // Check authorization
    if (customerId && order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this order'
      };
    }

    return {
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      customer: order.customer,
      orderType: order.orderType,
      status: order.status,
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        unit: item.unit,
        pricePerUnit: item.menuItem.pricePerUnit,
        subtotal: item.subtotal,
        notes: item.notes
      })),
      pricing: {
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        total: order.total
      },
      payment: order.payment,
      driver: order.driver,
      notes: order.notes,
      specialRequests: {
        levelPedas: order.levelPedas,
        kuahVarian: order.kuahVarian,
        telurType: order.telurType,
        rasaType: order.rasaType
      },
      timeline: order.statusHistory.map(h => ({
        timestamp: h.changedAt,
        status: h.newStatus,
        reason: h.reason
      }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get orders for export (customer history)
 */
const getOrdersForExport = async (customerId) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: {
            menuItem: { select: { name: true } },
            quantity: true
          }
        },
        payment: {
          select: { status: true, amount: true }
        }
      }
    });

    return orders.map(order => ({
      orderNumber: order.orderNumber,
      date: order.createdAt,
      type: order.orderType,
      status: order.status,
      items: order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', '),
      total: order.total,
      paymentStatus: order.payment?.status || 'PENDING'
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get order cancellation reasons (Admin stats)
 */
const getCancellationReasons = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const where = {
      status: 'CANCELLED',
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const reasons = await prisma.orderStatusHistory.groupBy({
      by: ['reason'],
      where: {
        newStatus: 'CANCELLED',
        ...(startDate && endDate && {
          changedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      _count: true,
      orderBy: { _count: { reason: 'desc' } }
    });

    const totalCancelled = await prisma.order.count({ where });

    return {
      totalCancelled,
      reasonBreakdown: reasons.map(r => ({
        reason: r.reason || 'No reason provided',
        count: r._count,
        percentage: Math.round((r._count / totalCancelled) * 100)
      }))
    };
  } catch (error) {
    throw error;
  }
};

export default {
  addOrderNotes,
  getOrderTimeline,
  addItemReview,
  getItemReviews,
  getOrderSummary,
  getOrdersForExport,
  getCancellationReasons
};