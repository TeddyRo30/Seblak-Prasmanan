'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { orders, isLoading, error, refetch } = useOrders({
    status: selectedStatus || undefined,
  });

  // Redirect jika belum login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  const getOrderTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      DINE_IN: '🍽️ Makan di Tempat',
      TAKEAWAY: '📦 Bawa Pulang',
      DELIVERY: '🚗 Antar ke Rumah',
    };
    return typeMap[type] || type;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📋 My Orders
          </h1>
          <p className="text-gray-600">
            Riwayat dan status pesanan Anda
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
            { value: 'NEW', label: '📝 New' },
            { value: 'CONFIRMED', label: '✅ Confirmed' },
            { value: 'PREPARING', label: '👨‍🍳 Preparing' },
            { value: 'READY', label: '🎉 Ready' },
            { value: 'DELIVERED', label: '📦 Delivered' },
            { value: 'CANCELLED', label: '❌ Cancelled' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(value)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                selectedStatus === value
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
              }`}
            >
              {label}
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
          // Empty State
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tidak Ada Pesanan
            </h2>
            <p className="text-gray-600 mb-8">
              Anda belum memiliki pesanan. Mulai pesan sekarang!
            </p>
            <Link
              href="/menu"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Pesan Sekarang →
            </Link>
          </div>
        ) : (
          // Orders List
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Order Number & Date */}
                      <div>
                        <p className="text-gray-600 text-sm">Order Number</p>
                        <p className="text-lg font-bold text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      {/* Order Type */}
                      <div>
                        <p className="text-gray-600 text-sm">Jenis Pesanan</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {getOrderTypeLabel(order.orderType)}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-gray-600 text-sm">Status</p>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color} mt-1`}>
                          {statusInfo.icon} {statusInfo.label}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <p className="text-gray-600 text-sm">Total</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatPrice(order.totalPrice)}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                          Lihat Detail →
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}