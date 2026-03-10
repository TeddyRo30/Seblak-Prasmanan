// src/services/orderService.js
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Validate order items (check stock availability)
 */
const validateOrderItems = async (items) => {
  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId }
    });

    if (!menuItem) {
      throw {
        status: 404,
        code: 'ITEM_NOT_FOUND',
        message: `Menu item ${item.menuItemId} not found`
      };
    }

    if (!menuItem.isAvailable) {
      throw {
        status: 400,
        code: 'ITEM_UNAVAILABLE',
        message: `Item "${menuItem.name}" is currently unavailable`
      };
    }

    if (menuItem.stockQuantity < item.quantity) {
      throw {
        status: 400,
        code: 'INSUFFICIENT_STOCK',
        message: `Item "${menuItem.name}" has only ${menuItem.stockQuantity} units available`
      };
    }
  }
};

/**
 * Calculate order total
 */
const calculateOrderTotal = async (items, deliveryFee = 0, discount = 0) => {
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId }
    });

    subtotal += menuItem.pricePerUnit * item.quantity;
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  return { subtotal, deliveryFee, discount, total };
};

/**
 * Create new order
 */
const createOrder = async (customerId, data) => {
  try {
    const {
      orderType,
      items,
      levelPedas = 'SEDANG',
      kuahVarian = 'NORMAL',
      telurType = 'CEPLOK',
      rasaType = 'ASIN',
      paymentMethod,
      deliveryFee = 0,
      discount = 0,
      notes,
      // DINE_IN
      tableNumber,
      // TAKE_AWAY
      pickupTime,
      customerNameTakeaway,
      customerPhoneTakeaway,
      // DELIVERY
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      deliveryTime,
      customerNameDelivery,
      customerPhoneDelivery,
      // Idempotency
      idempotencyKey
    } = data;

    // Validate input
    if (!orderType || !items || items.length === 0) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'orderType and items are required'
      };
    }

    if (!paymentMethod) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'paymentMethod is required'
      };
    }

    // Validate items exist and have stock
    await validateOrderItems(items);

    // Calculate totals
    const pricing = await calculateOrderTotal(items, deliveryFee, discount);

    // Validate order type specific fields
    if (orderType === 'DINE_IN') {
      if (!tableNumber) {
        throw {
          status: 400,
          code: 'INVALID_INPUT',
          message: 'tableNumber is required for DINE_IN orders'
        };
      }
    }

    if (orderType === 'TAKE_AWAY') {
      if (!pickupTime) {
        throw {
          status: 400,
          code: 'INVALID_INPUT',
          message: 'pickupTime is required for TAKE_AWAY orders'
        };
      }
    }

    if (orderType === 'DELIVERY') {
      if (!deliveryAddress || !deliveryLatitude || !deliveryLongitude) {
        throw {
          status: 400,
          code: 'INVALID_INPUT',
          message: 'deliveryAddress, deliveryLatitude, deliveryLongitude are required for DELIVERY orders'
        };
      }
    }

    // Check for duplicate order (idempotency)
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey }
      });

      if (existingOrder) {
        throw {
          status: 409,
          code: 'DUPLICATE_ORDER',
          message: 'Order with this idempotency key already exists',
          orderId: existingOrder.id
        };
      }
    }

    // Create order
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        orderType,
        status: 'NEW',
        paymentStatus: 'PENDING',
        paymentMethod,
        levelPedas,
        kuahVarian,
        telurType,
        rasaType,
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        discount: pricing.discount,
        total: pricing.total,
        idempotencyKey,
        notes,
        // DINE_IN
        ...(orderType === 'DINE_IN' && { tableNumber }),
        // TAKE_AWAY
        ...(orderType === 'TAKE_AWAY' && {
          pickupTime,
          customerNameTakeaway,
          customerPhoneTakeaway
        }),
        // DELIVERY
        ...(orderType === 'DELIVERY' && {
          deliveryAddress,
          deliveryLatitude,
          deliveryLongitude,
          deliveryTime,
          customerNameDelivery,
          customerPhoneDelivery
        }),
        // Create order items
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unit: item.unit,
            pricePerUnit: item.pricePerUnit,
            subtotal: item.pricePerUnit * item.quantity,
            notes: item.notes
          }))
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true
          }
        },
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return order;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user's orders
 */
const getUserOrders = async (customerId, options = {}) => {
  try {
    const { limit = 50, offset = 0, status } = options;

    const where = {
      customerId,
      ...(status && { status })
    };

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { menuItem: true }
        },
        payment: true,
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          }
        }
      }
    });

    const total = await prisma.order.count({ where });

    return {
      data: orders,
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
 * Get order by ID
 */
const getOrderById = async (orderId, customerId = null) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true
          }
        },
        items: {
          include: { menuItem: true }
        },
        payment: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        },
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true,
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

    // Check authorization (customer can only see own orders)
    if (customerId && order.customerId !== customerId) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to view this order'
      };
    }

    return order;
  } catch (error) {
    throw error;
  }
};

/**
 * Update order status (Admin/Kitchen staff)
 */
const updateOrderStatus = async (orderId, newStatus, reason = null, changedByUserId = null) => {
  try {
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

    // Validate status transition
    const validTransitions = {
      NEW: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: order.orderType === 'DELIVERY' ? ['PICKING', 'CANCELLED'] : ['PICKED_UP', 'COMPLETED', 'CANCELLED'],
      PICKING: ['ON_DELIVERY', 'CANCELLED'],
      ON_DELIVERY: ['DELIVERED', 'CANCELLED'],
      PICKED_UP: ['COMPLETED', 'CANCELLED'],
      DELIVERED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    };

    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw {
        status: 400,
        code: 'INVALID_STATUS_TRANSITION',
        message: `Cannot transition from ${order.status} to ${newStatus}`
      };
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        changedByUserId,
        statusChangeReason: reason,
        // Auto-complete when order picked up or delivered
        ...(newStatus === 'COMPLETED' && { completedAt: new Date() })
      },
      include: {
        items: {
          include: { menuItem: true }
        },
        payment: true,
        statusHistory: true
      }
    });

    // Create status history record
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: order.status,
        newStatus,
        changedBy: changedByUserId,
        reason
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders (Admin)
 */
const getAllOrders = async (options = {}) => {
  try {
    const { limit = 50, offset = 0, status, orderType, search } = options;

    const where = {
      ...(status && { status }),
      ...(orderType && { orderType }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search } },
          { customer: { fullName: { contains: search } } },
          { customer: { email: { contains: search } } }
        ]
      })
    };

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        items: {
          include: { menuItem: true }
        },
        driver: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    const total = await prisma.order.count({ where });

    return {
      data: orders,
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
 * Assign driver to order
 */
const assignDriver = async (orderId, driverId) => {
  try {
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

    if (order.orderType !== 'DELIVERY') {
      throw {
        status: 400,
        code: 'INVALID_ORDER_TYPE',
        message: 'Can only assign driver to DELIVERY orders'
      };
    }

    const driver = await prisma.user.findUnique({
      where: { id: driverId },
      select: { role: true }
    });

    if (!driver || driver.role !== 'driver') {
      throw {
        status: 404,
        code: 'DRIVER_NOT_FOUND',
        message: 'Driver not found'
      };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { assignedDriverId: driverId },
      include: {
        driver: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        }
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

/**
 * Cancel order
 */
const cancelOrder = async (orderId, reason = null) => {
  try {
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

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw {
        status: 400,
        code: 'CANNOT_CANCEL',
        message: `Cannot cancel order with status ${order.status}`
      };
    }

    // Update order
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        statusChangeReason: reason
      }
    });

    // Create status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: order.status,
        newStatus: 'CANCELLED',
        reason
      }
    });

    return updated;
  } catch (error) {
    throw error;
  }
};

export default {
  generateOrderNumber,
  validateOrderItems,
  calculateOrderTotal,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  assignDriver,
  cancelOrder
};