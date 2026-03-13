'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import Link from 'next/link';
import { orderService } from '@/services/order';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadOrder();
    }
  }, [isAuthenticated]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrderDetail(params.orderId);
      setOrder(data);
    } catch (err) {
      setError('Gagal memuat detail pesanan');
      console.error(err);
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

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; icon: string; color: string }> = {
      NEW: { label: 'Baru', icon: '📝', color: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Dikonfirmasi', icon: '✅', color: 'bg-green-100 text-green-800' },
      PREPARING: { label: 'Sedang Disiapkan', icon: '👨‍🍳', color: 'bg-yellow-100 text-yellow-800' },
      READY: { label: 'Siap', icon: '🎉', color: 'bg-purple-100 text-purple-800' },
      PICKED_UP: { label: 'Diambil', icon: '✋', color: 'bg-indigo-100 text-indigo-800' },
      ON_DELIVERY: { label: 'Sedang Diantar', icon: '🚗', color: 'bg-orange-100 text-orange-800' },
      DELIVERED: { label: 'Terkirim', icon: '📦', color: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Selesai', icon: '🏁', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Dibatalkan', icon: '❌', color: 'bg-red-100 text-red-800' },
    };
    return statusMap[status] || { label: status, icon: '❓', color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Memuat detail pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error}
            </h2>
            <Link
              href="/menu"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Kembali ke Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusLabel(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pesanan Berhasil!
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Terima kasih telah memesan di Seblak Prasmanan
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Nomor Pesanan</p>
            <p className="text-3xl font-bold text-blue-600">#{order.orderNumber}</p>
          </div>

          {/* Status Badge */}
          <div className={`inline-block px-6 py-3 rounded-full font-bold ${statusInfo.color} mb-6`}>
            {statusInfo.icon} {statusInfo.label}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 Detail Pesanan
          </h2>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div>
              <p className="text-gray-600 text-sm">Jenis Pesanan</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.orderType === 'DINE_IN' && '🍽️ Makan di Tempat'}
                {order.orderType === 'TAKEAWAY' && '📦 Bawa Pulang'}
                {order.orderType === 'DELIVERY' && '🚗 Antar ke Rumah'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Waktu Pemesanan</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Items List */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Item Pesanan:</h3>
          <div className="space-y-4 mb-6 pb-6 border-b">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {/* Item name will be displayed, structure depends on API response */}
                      Item {index + 1} x {item.quantity}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Tidak ada item</p>
            )}
          </div>

          {/* Price Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">
                {formatPrice(order.totalPrice * 0.909)} {/* Approximate */}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pajak (10%):</span>
              <span className="font-semibold">
                {formatPrice(order.totalPrice * 0.091)} {/* Approximate */}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-red-600">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-green-800 mb-4">✅ Langkah Selanjutnya:</h3>
          <ol className="list-decimal list-inside space-y-2 text-green-800">
            <li>Pesanan Anda akan segera dikonfirmasi oleh staff kami</li>
            <li>Dapur akan memulai persiapan makanan Anda</li>
            <li>
              {order.orderType === 'DELIVERY' && 'Driver kami akan mengantarkan pesanan ke lokasi Anda'}
              {order.orderType === 'TAKEAWAY' && 'Silakan ambil pesanan Anda di restoran'}
              {order.orderType === 'DINE_IN' && 'Makanan akan disajikan ke meja Anda'}
            </li>
            <li>Anda dapat melacak status pesanan di halaman "My Orders"</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href={`/orders/${order.id}`}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-center"
          >
            👁️ Lihat Detail Pesanan
          </Link>
          <Link
            href="/menu"
            className="flex-1 border border-red-600 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition text-center"
          >
            🍜 Pesan Lagi
          </Link>
        </div>
      </div>
    </div>
  );
}