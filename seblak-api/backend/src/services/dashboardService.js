// src/services/dashboardService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get overall dashboard metrics
 */
const getDashboardMetrics = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    // Default: today
    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    const where = {
      createdAt: {
        gte: start,
        lte: end
      }
    };

    // Total orders today
    const totalOrders = await prisma.order.count({ where });

    // Total revenue today
    const revenueData = await prisma.payment.aggregate({
      where: {
        ...where,
        status: 'CONFIRMED'
      },
      _sum: { amount: true }
    });
    const totalRevenue = revenueData._sum.amount || 0;

    // Total customers (unique) today
    const totalCustomers = await prisma.order.findMany({
      where,
      distinct: ['customerId'],
      select: { customerId: true }
    });

    // Orders by type
    const ordersByType = await prisma.order.groupBy({
      by: ['orderType'],
      where,
      _count: true
    });

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    // Average order value
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalOrders,
      totalRevenue,
      totalCustomers: totalCustomers.length,
      avgOrderValue,
      ordersByType,
      ordersByStatus,
      dateRange: {
        start,
        end
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get orders overview
 */
const getOrdersOverview = async (options = {}) => {
  try {
    const { limit = 10, status } = options;

    const where = {
      ...(status && { status })
    };

    const orders = await prisma.order.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            fullName: true,
            email: true
          }
        },
        items: {
          select: {
            quantity: true,
            menuItem: {
              select: { name: true }
            }
          }
        },
        payment: {
          select: {
            status: true,
            paymentMethod: true
          }
        }
      }
    });

    return orders;
  } catch (error) {
    throw error;
  }
};

/**
 * Get revenue by date range
 */
const getRevenueByDateRange = async (options = {}) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get all payments in range
    const payments = await prisma.payment.findMany({
      where: {
        status: 'CONFIRMED',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    // Group by date
    const revenueByDate = {};

    payments.forEach(payment => {
      let dateKey;
      const date = new Date(payment.createdAt);

      if (groupBy === 'day') {
        dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = `Week of ${weekStart.toISOString().split('T')[0]}`;
      } else if (groupBy === 'month') {
        dateKey = date.toISOString().substring(0, 7); // YYYY-MM
      }

      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      revenueByDate[dateKey] += payment.amount;
    });

    // Convert to array
    const data = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue
    }));

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get top selling items
 */
const getTopSellingItems = async (options = {}) => {
  try {
    const { limit = 10, startDate, endDate } = options;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      },
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit
    });

    // Get item details
    const items = await Promise.all(
      topItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: {
            id: true,
            name: true,
            pricePerUnit: true,
            category: { select: { name: true } }
          }
        });

        return {
          ...menuItem,
          totalQuantitySold: item._sum.quantity,
          totalRevenue: (item._sum.quantity || 0) * (menuItem?.pricePerUnit || 0),
          orderCount: item._count
        };
      })
    );

    return items.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
  } catch (error) {
    throw error;
  }
};

/**
 * Get payment methods distribution
 */
const getPaymentMethodsDistribution = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const distribution = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        status: 'CONFIRMED',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: true,
      _sum: { amount: true }
    });

    return distribution.map(item => ({
      method: item.paymentMethod,
      count: item._count,
      totalAmount: item._sum.amount,
      percentage: 0 // Will calculate after
    })).map((item, _, arr) => ({
      ...item,
      percentage: Math.round((item.totalAmount / arr.reduce((sum, i) => sum + i.totalAmount, 0)) * 100)
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get order status distribution
 */
const getOrderStatusDistribution = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const distribution = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: true
    });

    return distribution.map(item => ({
      status: item.status,
      count: item._count
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get low stock alerts
 */
const getLowStockAlerts = async () => {
  try {
    // Fetch all items with stock
    const allItems = await prisma.menuItem.findMany({
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    // Filter items where stock <= threshold (di JavaScript)
    const lowStockItems = allItems.filter(
      item => item.stockQuantity <= item.lowStockThreshold
    );

    // Sort by stock ascending
    lowStockItems.sort((a, b) => a.stockQuantity - b.stockQuantity);

    return lowStockItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category.name,
      currentStock: item.stockQuantity,
      threshold: item.lowStockThreshold,
      status: item.stockQuantity === 0 ? 'out_of_stock' : 'low_stock'
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get customer summary
 */
const getCustomerSummary = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    // Total unique customers
    const totalCustomers = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      distinct: ['customerId'],
      select: { customerId: true }
    });

    // New customers today
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

    const newCustomersToday = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      distinct: ['customerId'],
      select: { customerId: true }
    });

    // Total spent per customer
    const customerSpending = await prisma.order.groupBy({
      by: ['customerId'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: { total: true },
      _count: true
    });

    const avgSpendingPerCustomer = customerSpending.length > 0
      ? Math.round(customerSpending.reduce((sum, c) => sum + (c._sum.total || 0), 0) / customerSpending.length)
      : 0;

    return {
      totalUniqueCustomers: totalCustomers.length,
      newCustomersToday: newCustomersToday.length,
      avgSpendingPerCustomer,
      customerSpending: customerSpending.map(c => ({
        customerId: c.customerId,
        totalSpent: c._sum.total,
        orderCount: c._count
      }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get complete dashboard data
 */
const getCompleteDashboardData = async (options = {}) => {
  try {
    const metrics = await getDashboardMetrics(options);
    const ordersOverview = await getOrdersOverview({ limit: 5 });
    const topItems = await getTopSellingItems({ limit: 5 });
    const paymentMethods = await getPaymentMethodsDistribution(options);
    const orderStatus = await getOrderStatusDistribution(options);
    const lowStock = await getLowStockAlerts();
    const customerSummary = await getCustomerSummary(options);

    return {
      metrics,
      ordersOverview,
      topItems,
      paymentMethods,
      orderStatus,
      lowStock,
      customerSummary,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardMetrics,
  getOrdersOverview,
  getRevenueByDateRange,
  getTopSellingItems,
  getPaymentMethodsDistribution,
  getOrderStatusDistribution,
  getLowStockAlerts,
  getCustomerSummary,
  getCompleteDashboardData
};