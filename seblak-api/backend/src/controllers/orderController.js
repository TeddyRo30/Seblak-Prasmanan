// src/controllers/orderController.js
import orderService from '../services/orderService.js';

/**
 * POST /api/v1/orders
 * Create new order
 */
const createOrder = async (req, res, next) => {
  try {
    const customerId = req.user.sub; // From JWT
    const {
      orderType,
      items,
      levelPedas,
      kuahVarian,
      telurType,
      rasaType,
      paymentMethod,
      deliveryFee,
      discount,
      notes,
      tableNumber,
      pickupTime,
      customerNameTakeaway,
      customerPhoneTakeaway,
      deliveryAddress,
      deliveryLatitude,
      deliveryLongitude,
      deliveryTime,
      customerNameDelivery,
      customerPhoneDelivery,
      idempotencyKey
    } = req.body;

    // Get items with their prices
    const itemsWithPrices = await Promise.all(
      items.map(async (item) => {
        // Get menu item for price
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });
        await prisma.$disconnect();

        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unit: menuItem.unit,
          pricePerUnit: menuItem.pricePerUnit,
          notes: item.notes
        };
      })
    );

    const order = await orderService.createOrder(customerId, {
      orderType,
      items: itemsWithPrices,
      levelPedas,
      kuahVarian,
      telurType,
      rasaType,
      paymentMethod,
      deliveryFee: parseInt(deliveryFee || 0),
      discount: parseInt(discount || 0),
      notes,
      tableNumber: parseInt(tableNumber),
      pickupTime,
      customerNameTakeaway,
      customerPhoneTakeaway,
      deliveryAddress,
      deliveryLatitude: parseFloat(deliveryLatitude),
      deliveryLongitude: parseFloat(deliveryLongitude),
      deliveryTime,
      customerNameDelivery,
      customerPhoneDelivery,
      idempotencyKey
    });

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Order created successfully',
      data: order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders
 * Get user's orders
 */
const getUserOrders = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { limit = 50, offset = 0, status } = req.query;

    const result = await orderService.getUserOrders(customerId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Orders retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:id
 * Get order detail
 */
const getOrderDetail = async (req, res, next) => {
  try {
    const customerId = req.user.sub; // Will be null if not authenticated
    const { id } = req.params;

    const order = await orderService.getOrderById(id, customerId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order retrieved successfully',
      data: order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:id/tracking
 * Get order tracking info
 */
const getOrderTracking = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { id } = req.params;

    const order = await orderService.getOrderById(id, customerId);

    const trackingInfo = {
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      status: order.status,
      createdAt: order.createdAt,
      estimatedTime: order.deliveryTime || order.pickupTime,
      driver: order.driver || null,
      location: order.orderType === 'DELIVERY' ? {
        latitude: order.deliveryLatitude,
        longitude: order.deliveryLongitude,
        address: order.deliveryAddress
      } : null,
      statusHistory: order.statusHistory
    };

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Tracking information retrieved',
      data: trackingInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/orders/:id
 * Cancel order
 */
const cancelOrder = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { id } = req.params;
    const { reason } = req.body;

    // Verify ownership
    const order = await orderService.getOrderById(id, customerId);

    const cancelled = await orderService.cancelOrder(id, reason);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order cancelled successfully',
      data: cancelled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ===== ADMIN ENDPOINTS =====
 */

/**
 * GET /api/v1/admin/orders
 * Get all orders (Admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, status, orderType, search } = req.query;

    const result = await orderService.getAllOrders({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      orderType,
      search
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Orders retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id/status
 * Update order status (Admin/Kitchen staff)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus, reason } = req.body;
    const changedByUserId = req.user.sub;

    if (!newStatus) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'newStatus is required'
      };
    }

    const updated = await orderService.updateOrderStatus(
      id,
      newStatus,
      reason,
      changedByUserId
    );

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order status updated successfully',
      data: updated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/orders/:id/assign-driver
 * Assign driver to order (Admin)
 */
const assignDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'driverId is required'
      };
    }

    const updated = await orderService.assignDriver(id, driverId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Driver assigned successfully',
      data: updated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:id/status-history
 * Get order status history
 */
const getStatusHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await orderService.getOrderById(id);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Status history retrieved',
      data: order.statusHistory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createOrder,
  getUserOrders,
  getOrderDetail,
  getOrderTracking,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  assignDriver,
  getStatusHistory
};