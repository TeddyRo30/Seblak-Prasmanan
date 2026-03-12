// src/controllers/dashboardController.js
import dashboardService from '../services/dashboardService.js';

/**
 * GET /api/v1/admin/dashboard
 * Get complete dashboard data
 */
const getDashboard = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await dashboardService.getCompleteDashboardData({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Dashboard data retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/metrics
 * Get dashboard metrics only
 */
const getMetrics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const metrics = await dashboardService.getDashboardMetrics({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/orders
 * Get orders overview
 */
const getOrdersOverview = async (req, res, next) => {
  try {
    const { limit = 10, status } = req.query;

    const orders = await dashboardService.getOrdersOverview({
      limit: parseInt(limit),
      status
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Orders overview retrieved successfully',
      data: orders,
      count: orders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/revenue
 * Get revenue by date range
 */
const getRevenue = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'startDate and endDate are required'
      };
    }

    const revenue = await dashboardService.getRevenueByDateRange({
      startDate,
      endDate,
      groupBy
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Revenue data retrieved successfully',
      data: revenue,
      groupBy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/top-items
 * Get top selling items
 */
const getTopItems = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const items = await dashboardService.getTopSellingItems({
      limit: parseInt(limit),
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Top selling items retrieved successfully',
      data: items,
      count: items.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/payment-methods
 * Get payment methods distribution
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const methods = await dashboardService.getPaymentMethodsDistribution({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Payment methods distribution retrieved successfully',
      data: methods,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/order-status
 * Get order status distribution
 */
const getOrderStatus = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const status = await dashboardService.getOrderStatusDistribution({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order status distribution retrieved successfully',
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/low-stock
 * Get low stock alerts
 */
const getLowStock = async (req, res, next) => {
  try {
    const alerts = await dashboardService.getLowStockAlerts();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Low stock alerts retrieved successfully',
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/dashboard/customers
 * Get customer summary
 */
const getCustomerSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await dashboardService.getCustomerSummary({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Customer summary retrieved successfully',
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboard,
  getMetrics,
  getOrdersOverview,
  getRevenue,
  getTopItems,
  getPaymentMethods,
  getOrderStatus,
  getLowStock,
  getCustomerSummary
};