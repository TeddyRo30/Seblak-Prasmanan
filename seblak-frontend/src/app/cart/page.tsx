'use client';

import { Navbar } from '@/components/layout';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CartPage() {
  const { items, totalPrice, totalItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login jika belum authenticated
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
            🛒 Shopping Cart
          </h1>
          <p className="text-gray-600">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {items.length === 0 ? (
          // Empty Cart
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Keranjang Anda Kosong
            </h2>
            <p className="text-gray-600 mb-8">
              Mulai pesan menu seblak favorit Anda sekarang!
            </p>
            <Link
              href="/menu"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Kembali ke Menu →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`p-6 flex gap-4 ${
                      index !== items.length - 1 ? 'border-b' : ''
                    }`}
                  >
                    {/* Item Image */}
                    {item.image ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 text-3xl">
                        🍜
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.name}
                      </h3>

                      {/* Options */}
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        {item.levelPedas && (
                          <p>
                            🌶️ Kepedasan:{' '}
                            <span className="font-semibold">
                              {item.levelPedas === 'TIDAK_PEDAS' && 'Tidak Pedas'}
                              {item.levelPedas === 'SEDANG' && 'Sedang'}
                              {item.levelPedas === 'PEDAS' && 'Pedas'}
                            </span>
                          </p>
                        )}
                        {item.kuahVarian && (
                          <p>
                            🍯 Varian Kuah:{' '}
                            <span className="font-semibold">{item.kuahVarian}</span>
                          </p>
                        )}
                        {item.notes && (
                          <p>
                            📝 Catatan:{' '}
                            <span className="font-semibold">{item.notes}</span>
                          </p>
                        )}
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                        >
                          −
                        </button>
                        <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                        <p className="text-xl font-bold text-red-600">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menuItemId)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="px-6 py-4 border-t flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus semua item?')) {
                        clearCart();
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Hapus Semua Item
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} item):</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-semibold">
                      {formatPrice(totalPrice * 0.1)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(totalPrice * 1.1)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition text-center"
                >
                  Lanjut ke Checkout →
                </Link>

                <Link
                  href="/menu"
                  className="block w-full mt-3 border border-red-600 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition text-center"
                >
                  Kembali ke Menu
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}