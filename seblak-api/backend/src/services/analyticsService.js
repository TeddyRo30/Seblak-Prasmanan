// src/services/analyticsService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get sales analytics
 */
const getSalesAnalytics = async (options = {}) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Total sales in period
    const totalSalesData = await prisma.payment.aggregate({
      where: {
        status: 'CONFIRMED',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: { amount: true },
      _count: true
    });

    // Sales by order type
    const salesByType = await prisma.order.groupBy({
      by: ['orderType'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        paymentStatus: 'CONFIRMED'
      },
      _sum: { total: true },
      _count: true
    });

    // Sales by payment method
    const salesByMethod = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        status: 'CONFIRMED',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _sum: { amount: true },
      _count: true
    });

    // Hourly/Daily/Weekly sales
    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        paymentStatus: 'CONFIRMED'
      },
      select: {
        total: true,
        createdAt: true
      }
    });

    const salesByDate = {};
    allOrders.forEach(order => {
      let dateKey;
      const date = new Date(order.createdAt);

      if (groupBy === 'day') {
        dateKey = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = `Week of ${weekStart.toISOString().split('T')[0]}`;
      } else if (groupBy === 'month') {
        dateKey = date.toISOString().substring(0, 7);
      }

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = 0;
      }
      salesByDate[dateKey] += order.total;
    });

    return {
      totalRevenue: totalSalesData._sum.amount || 0,
      totalOrders: totalSalesData._count,
      avgOrderValue: totalSalesData._count > 0 
        ? Math.round((totalSalesData._sum.amount || 0) / totalSalesData._count)
        : 0,
      byOrderType: salesByType.map(s => ({
        type: s.orderType,
        revenue: s._sum.total,
        count: s._count
      })),
      byPaymentMethod: salesByMethod.map(s => ({
        method: s.paymentMethod,
        revenue: s._sum.amount,
        count: s._count
      })),
      byDate: Object.entries(salesByDate).map(([date, revenue]) => ({
        date,
        revenue
      }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get customer analytics
 */
const getCustomerAnalytics = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Total customers
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'customer'
      }
    });

    // New customers in period
    const newCustomersInPeriod = await prisma.user.count({
      where: {
        role: 'customer',
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    // Repeat customers
    const repeatCustomers = await prisma.user.findMany({
      where: {
        role: 'customer',
        orders: {
          some: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        }
      },
      select: {
        id: true,
        _count: {
          select: { orders: true }
        }
      }
    });

    const repeatCount = repeatCustomers.filter(c => c._count.orders > 1).length;

    // Customer spending
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

    // Average spending per customer
    const avgSpending = customerSpending.length > 0
      ? Math.round(
          customerSpending.reduce((sum, c) => sum + (c._sum.total || 0), 0) /
          customerSpending.length
        )
      : 0;

    // Customer retention (customers who ordered in both previous and current period)
    const previousPeriodStart = new Date(start);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (end.getDate() - start.getDate()));

    const previousCustomers = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: start
        }
      },
      distinct: ['customerId'],
      select: { customerId: true }
    });

    const currentCustomers = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      distinct: ['customerId'],
      select: { customerId: true }
    });

    const retentionRate = previousCustomers.length > 0
      ? Math.round(
          (previousCustomers.filter(pc =>
            currentCustomers.some(cc => cc.customerId === pc.customerId)
          ).length / previousCustomers.length) * 100
        )
      : 0;

    return {
      totalCustomers,
      newCustomersInPeriod,
      repeatCustomers: repeatCount,
      avgSpendingPerCustomer: avgSpending,
      totalSpentInPeriod: customerSpending.reduce((sum, c) => sum + (c._sum.total || 0), 0),
      retentionRate: `${retentionRate}%`
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get order analytics
 */
const getOrderAnalytics = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Total orders
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    // Completed orders
    const completedOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        status: 'COMPLETED'
      }
    });

    // Cancelled orders
    const cancelledOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        status: 'CANCELLED'
      }
    });

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: true
    });

    // Average order processing time
    const completedOrdersData = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          not: null
        },
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    let avgProcessingTime = 0;
    if (completedOrdersData.length > 0) {
      const totalTime = completedOrdersData.reduce((sum, order) => {
        const time = (order.completedAt - order.createdAt) / (1000 * 60); // minutes
        return sum + time;
      }, 0);
      avgProcessingTime = Math.round(totalTime / completedOrdersData.length);
    }

    // Fulfillment rate
    const fulfillmentRate = totalOrders > 0
      ? Math.round((completedOrders / totalOrders) * 100)
      : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders: totalOrders - completedOrders - cancelledOrders,
      fulfillmentRate: `${fulfillmentRate}%`,
      cancellationRate: totalOrders > 0 ? `${Math.round((cancelledOrders / totalOrders) * 100)}%` : '0%',
      avgProcessingTimeMinutes: avgProcessingTime,
      byStatus: ordersByStatus.map(s => ({
        status: s.status,
        count: s._count
      }))
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get item performance analytics
 */
const getItemAnalytics = async (options = {}) => {
  try {
    const { startDate, endDate, limit = 10 } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Best selling items
    const bestSellers = await prisma.orderItem.groupBy({
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

    // Get item details for best sellers
    const bestSellersWithDetails = await Promise.all(
      bestSellers.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: {
            name: true,
            pricePerUnit: true,
            category: { select: { name: true } }
          }
        });

        return {
          name: menuItem?.name,
          category: menuItem?.category.name,
          quantitySold: item._sum.quantity,
          orderCount: item._count,
          revenue: (item._sum.quantity || 0) * (menuItem?.pricePerUnit || 0)
        };
      })
    );

    // Worst selling items
    const worstSellers = await prisma.orderItem.groupBy({
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
      orderBy: { _sum: { quantity: 'asc' } },
      take: limit
    });

    const worstSellersWithDetails = await Promise.all(
      worstSellers.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: {
            name: true,
            pricePerUnit: true,
            category: { select: { name: true } }
          }
        });

        return {
          name: menuItem?.name,
          category: menuItem?.category.name,
          quantitySold: item._sum.quantity,
          orderCount: item._count,
          revenue: (item._sum.quantity || 0) * (menuItem?.pricePerUnit || 0)
        };
      })
    );

    return {
      bestSellers: bestSellersWithDetails,
      worstSellers: worstSellersWithDetails
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get comprehensive analytics report
 */
const getComprehensiveAnalyticsReport = async (options = {}) => {
  try {
    const sales = await getSalesAnalytics(options);
    const customers = await getCustomerAnalytics(options);
    const orders = await getOrderAnalytics(options);
    const items = await getItemAnalytics(options);

    return {
      period: {
        start: options.startDate,
        end: options.endDate
      },
      sales,
      customers,
      orders,
      items,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getSalesAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics,
  getItemAnalytics,
  getComprehensiveAnalyticsReport
};