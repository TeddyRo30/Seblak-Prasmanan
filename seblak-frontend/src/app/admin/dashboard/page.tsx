'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/order';
import { Navbar } from '@/components/layout';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersOverview, setOrdersOverview] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any>(null);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    } else {
      loadDashboardData();
    }
  }, [isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [metricsData, ordersData, topItemsData, paymentData] = await Promise.all([
        orderService.adminGetMetrics().catch(() => null),
        orderService.adminGetOrdersOverview().catch(() => null),
        orderService.adminGetTopItems().catch(() => []),
        orderService.adminGetPaymentStats().catch(() => null),
      ]);

      setMetrics(metricsData);
      setOrdersOverview(ordersData);
      setTopItems(topItemsData || []);
      setPaymentStats(paymentData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
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

  const MetricCard = ({ title, value, icon, color }: any) => (
    <div className={`${color} rounded-lg shadow p-6 text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your restaurant's performance
          </p>
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
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Today's Orders"
                value={metrics?.todayOrders || 0}
                icon="📋"
                color="bg-blue-600"
              />
              <MetricCard
                title="Total Revenue"
                value={formatPrice(metrics?.totalRevenue || 0)}
                icon="💰"
                color="bg-green-600"
              />
              <MetricCard
                title="Completed Orders"
                value={metrics?.completedOrders || 0}
                icon="✅"
                color="bg-purple-600"
              />
              <MetricCard
                title="Active Orders"
                value={metrics?.activeOrders || 0}
                icon="🚗"
                color="bg-orange-600"
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Orders Overview */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📈 Orders Overview
                </h2>

                {ordersOverview ? (
                  <div className="space-y-4">
                    {Object.entries(ordersOverview).map(([status, count]: [string, any]) => (
                      <div key={status} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                        <span className="font-semibold text-gray-900">
                          {status.replace(/_/g, ' ')}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No data available</p>
                )}

                <Link
                  href="/admin/orders"
                  className="block text-center mt-6 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View All Orders →
                </Link>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💳 Payment Methods
                </h2>

                {paymentStats ? (
                  <div className="space-y-4">
                    {Object.entries(paymentStats).map(([method, count]: [string, any]) => (
                      <div key={method} className="flex justify-between items-center">
                        <span className="text-gray-700">{method}</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-bold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No data available</p>
                )}
              </div>
            </div>

            {/* Top Items */}
            {topItems.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🍜 Top Selling Items
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topItems.slice(0, 4).map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index >= 3 && '🍜'}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Sold: {item.totalSold} times
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  href="/admin/menu"
                  className="block text-center mt-6 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Manage Menu →
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/orders"
                className="bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition text-center"
              >
                📋 Manage Orders
              </Link>
              <Link
                href="/admin/menu"
                className="bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition text-center"
              >
                🍜 Manage Menu
              </Link>
              <button
                onClick={loadDashboardData}
                className="bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 transition"
              >
                🔄 Refresh Data
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}