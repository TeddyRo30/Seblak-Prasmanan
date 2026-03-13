'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';
import OrderTimeline from '@/components/order/OrderTimeline';
import Link from 'next/link';

export default function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { getOrderDetail, getOrderTimeline, cancelOrder } = useOrders();

  // Redirect jika belum login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      loadOrderData();
    }
  }, [isAuthenticated, params.orderId, router]);

  const loadOrderData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const orderData = await getOrderDetail(params.orderId);
      setOrder(orderData);
      setNotes(orderData.notes || '');

      const timelineData = await getOrderTimeline(params.orderId);
      setTimeline(timelineData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: string }> = {
      NEW: { label: 'Baru', color: 'bg-blue-100 text-blue-800', icon: '📝' },
      CONFIRMED: { label: 'Dikonfirmasi', color: 'bg-green-100 text-green-800', icon: '✅' },
      PREPARING: { label: 'Disiapkan', color: 'bg-yellow-100 text-yellow-800', icon: '👨‍🍳' },
      READY: { label: 'Siap', color: 'bg-purple-100 text-purple-800', icon: '🎉' },
      PICKED_UP: { label: 'Diambil', color: 'bg-indigo-100 text-indigo-800', icon: '✋' },
      ON_DELIVERY: { label: 'Diantar', color: 'bg-orange-100 text-orange-800', icon: '🚗' },
      DELIVERED: { label: 'Terkirim', color: 'bg-green-100 text-green-800', icon: '📦' },
      COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: '🏁' },
      CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800', icon: '❌' },
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: '❓' };
    return info;
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(params.orderId);
      setShowCancelModal(false);
      await loadOrderData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Order not found'}
            </h2>
            <Link
              href="/orders"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(order.status);
  const canCancel = ['NEW', 'CONFIRMED'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-block">
            ← Back to Orders
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Ordered on {new Date(order.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
            <div className={`inline-block px-6 py-3 rounded-full font-bold ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  📍 Order Timeline
                </h2>
                <OrderTimeline timeline={timeline} />
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🍜 Items
              </h2>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <p className="font-bold text-gray-900">
                        Item {index + 1}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Quantity: {item.quantity}
                      </p>
                      {item.notes && (
                        <p className="text-gray-600 text-sm">
                          📝 Notes: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No items found</p>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📝 Notes
              </h2>
              <p className="text-gray-600">
                {notes || 'No special notes for this order'}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                💰 Summary
              </h3>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    {formatPrice(order.totalPrice * 0.909)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-semibold">
                    {formatPrice(order.totalPrice * 0.091)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong>{' '}
                  {order.orderType === 'DINE_IN' && '🍽️ Dine In'}
                  {order.orderType === 'TAKEAWAY' && '📦 Takeaway'}
                  {order.orderType === 'DELIVERY' && '🚗 Delivery'}
                </p>
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                ❌ Cancel Order
              </button>
            )}

            {order.status === 'DELIVERED' && (
              <Link
                href={`/orders/${order.id}/review`}
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                ⭐ Review Order
              </Link>
            )}
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Cancel Order?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel order #{order.orderNumber}?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 border border-gray-300 text-gray-900 py-2 rounded-lg font-bold hover:bg-gray-50"
                >
                  No, Keep It
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400"
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}