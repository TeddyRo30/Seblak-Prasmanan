'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/order';
import { Navbar } from '@/components/layout';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [salesData, setSalesData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    } else {
      loadAnalyticsData();
    }
  }, [isAuthenticated, user, router]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [sales, customers, orders] = await Promise.all([
        orderService.adminGetRevenue({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }).catch(() => null),
        orderService.adminGetMetrics().catch(() => null),
        orderService.adminGetOrdersOverview().catch(() => null),
      ]);

      setSalesData(sales);
      setCustomerData(customers);
      setOrderData(orders);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const StatCard = ({ title, value, subtext, icon, color }: any) => (
    <div className={`${color} rounded-lg shadow p-6 text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtext && <p className="text-sm opacity-75 mt-1">{subtext}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Analytics
          </h1>
          <p className="text-gray-600">
            View detailed analytics and performance metrics
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📅 Date Range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={loadAnalyticsData}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Orders"
                value={customerData?.totalOrders || 0}
                icon="📋"
                color="bg-blue-600"
              />
              <StatCard
                title="Total Revenue"
                value={formatPrice(customerData?.totalRevenue || 0)}
                icon="💰"
                color="bg-green-600"
              />
              <StatCard
                title="Average Order Value"
                value={formatPrice((customerData?.totalRevenue || 0) / (customerData?.totalOrders || 1))}
                icon="📊"
                color="bg-purple-600"
              />
              <StatCard
                title="Total Customers"
                value={customerData?.totalCustomers || 0}
                icon="👥"
                color="bg-orange-600"
              />
            </div>

            {/* Orders Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Order Status Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📊 Orders by Status
                </h2>

                {orderData ? (
                  <div className="space-y-4">
                    {Object.entries(orderData).map(([status, count]: [string, any]) => {
                      const numericCount = Number(count) || 0;
                      const total = (Object.values(orderData) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
                      const percentage = total > 0 ? ((numericCount / total) * 100).toFixed(1) : "0.0";

                      return (
                        <div key={status}>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-700">
                              {status.replace(/_/g, ' ')}
                            </span>
                            <span className="font-bold text-gray-900">
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No data available</p>
                )}
              </div>

              {/* Sales Trend */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📈 Sales Trend
                </h2>

                {salesData ? (
                  <div className="space-y-4">
                    {Array.isArray(salesData) && salesData.slice(0, 7).map((day: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">
                            {day.date || `Day ${index + 1}`}
                          </span>
                          <span className="font-bold text-gray-900">
                            {formatPrice(day.revenue || 0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${((day.revenue || 0) / Math.max(...(Array.isArray(salesData) ? salesData.map((d: any) => d.revenue || 0) : [1]))) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No data available</p>
                )}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📋 Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Orders in Period</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {customerData?.totalOrders || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Revenue in Period</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {formatPrice(customerData?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Completed Orders</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {customerData?.completedOrders || 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}