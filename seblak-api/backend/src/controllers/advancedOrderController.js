// src/controllers/advancedOrderController.js
import advancedOrderService from '../services/advancedOrderService.js';

/**
 * PATCH /api/v1/orders/:orderId/notes
 * Add/update order notes
 */
const addOrderNotes = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { orderId } = req.params;
    const { notes } = req.body;

    const order = await advancedOrderService.addOrderNotes(orderId, customerId, notes);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order notes updated successfully',
      data: order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:orderId/timeline
 * Get order timeline
 */
const getOrderTimeline = async (req, res, next) => {
  try {
    const customerId = req.user?.sub;
    const { orderId } = req.params;

    const timeline = await advancedOrderService.getOrderTimeline(orderId, customerId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order timeline retrieved successfully',
      data: timeline,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/orders/:orderId/items/:menuItemId/review
 * Add item review
 */
const addItemReview = async (req, res, next) => {
  try {
    const customerId = req.user.sub;
    const { orderId, menuItemId } = req.params;
    const { rating, comment } = req.body;

    const review = await advancedOrderService.addItemReview(
      orderId,
      customerId,
      menuItemId,
      parseInt(rating),
      comment
    );

    res.status(201).json({
      success: true,
      status: 201,
      message: 'Item review added successfully',
      data: review,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/menu/items/:menuItemId/reviews
 * Get item reviews
 */
const getItemReviews = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const { limit = 10 } = req.query;

    const result = await advancedOrderService.getItemReviews(menuItemId, parseInt(limit));

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Item reviews retrieved successfully',
      data: result.reviews,
      avgRating: result.avgRating,
      totalReviews: result.totalReviews,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:orderId/summary
 * Get order summary for export
 */
const getOrderSummary = async (req, res, next) => {
  try {
    const customerId = req.user?.sub;
    const { orderId } = req.params;

    const summary = await advancedOrderService.getOrderSummary(orderId, customerId);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order summary retrieved successfully',
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/export
 * Get all orders for export
 */
const exportOrders = async (req, res, next) => {
  try {
    const customerId = req.user.sub;

    const orders = await advancedOrderService.getOrdersForExport(customerId);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.json');

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/orders/cancellation-reasons
 * Get cancellation reasons (Admin)
 */
const getCancellationReasons = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await advancedOrderService.getCancellationReasons({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Cancellation reasons retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  addOrderNotes,
  getOrderTimeline,
  addItemReview,
  getItemReviews,
  getOrderSummary,
  exportOrders,
  getCancellationReasons
};