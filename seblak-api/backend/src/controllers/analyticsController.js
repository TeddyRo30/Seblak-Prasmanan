// src/controllers/analyticsController.js
import analyticsService from '../services/analyticsService.js';

/**
 * GET /api/v1/admin/analytics/sales
 * Get sales analytics
 */
const getSalesAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'startDate and endDate are required'
      };
    }

    const analytics = await analyticsService.getSalesAnalytics({
      startDate,
      endDate,
      groupBy
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Sales analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/analytics/customers
 * Get customer analytics
 */
const getCustomerAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'startDate and endDate are required'
      };
    }

    const analytics = await analyticsService.getCustomerAnalytics({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Customer analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/analytics/orders
 * Get order analytics
 */
const getOrderAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'startDate and endDate are required'
      };
    }

    const analytics = await analyticsService.getOrderAnalytics({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Order analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/analytics/items
 * Get item performance analytics
 */
const getItemAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'startDate and endDate are required'
      };
    }

    const analytics = await analyticsService.getItemAnalytics({
      startDate,
      endDate,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Item analytics retrieved successfully',
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/analytics/report
 * Get comprehensive analytics report
 */
const getComprehensiveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      throw {
        status: 400,
        code: 'INVALID_INPUT',
        message: 'startDate and endDate are required'
      };
    }

    const report = await analyticsService.getComprehensiveAnalyticsReport({
      startDate,
      endDate,
      groupBy
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: 'Analytics report generated successfully',
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getSalesAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics,
  getItemAnalytics,
  getComprehensiveReport
};