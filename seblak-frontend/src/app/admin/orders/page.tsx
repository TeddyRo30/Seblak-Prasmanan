'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/order';
import { Navbar } from '@/components/layout';
import { Order } from '@/types';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    } else {
      loadOrders();
    }
  }, [isAuthenticated, user, router, selectedStatus]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await orderService.adminGetAllOrders({
        status: selectedStatus || undefined,
      });
      setOrders(data.orders);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string) => {
    if (!newStatus) return;

    setIsUpdating(true);
    try {
      await orderService.adminUpdateOrderStatus(orderId, newStatus);
      setSelectedOrderId(null);
      setNewStatus('');
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      NEW: { label: 'New', color: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
      PREPARING: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-800' },
      READY: { label: 'Ready', color: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return info;
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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
            📋 Manage Orders
          </h1>
          <p className="text-gray-600">
            View and manage all customer orders
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition ${
              selectedStatus === ''
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
            }`}
          >
            All Orders
          </button>

          {[
            'NEW',
            'CONFIRMED',
            'PREPARING',
            'READY',
            'DELIVERED',
            'CANCELLED',
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                selectedStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Orders Found
            </h2>
            <p className="text-gray-600">
              There are no orders with the selected status.
            </p>
          </div>
        ) : (
          // Orders Table
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => {
                    const statusInfo = getStatusBadge(order.status);
                    const isSelected = selectedOrderId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {order.orderType === 'DINE_IN' && '🍽️'}
                          {order.orderType === 'TAKEAWAY' && '📦'}
                          {order.orderType === 'DELIVERY' && '🚗'}
                          {' '}
                          {order.orderType}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-red-600">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedOrderId(isSelected ? null : order.id);
                                setNewStatus(order.status);
                              }}
                              className="text-green-600 hover:text-green-800 font-semibold text-sm"
                            >
                              Update
                            </button>
                          </div>

                          {/* Update Status Form */}
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                {[
                                  'NEW',
                                  'CONFIRMED',
                                  'PREPARING',
                                  'READY',
                                  'DELIVERED',
                                  'CANCELLED',
                                ].map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleStatusUpdate(order.id)}
                                disabled={isUpdating}
                                className="w-full bg-green-600 text-white py-1 rounded text-sm font-bold hover:bg-green-700 disabled:bg-gray-400"
                              >
                                {isUpdating ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}