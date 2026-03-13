'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { orderService } from '@/services/order';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Redirect jika belum login atau cart kosong
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
    if (items.length === 0) {
      router.push('/menu');
    }
  }, [isAuthenticated, items, router]);

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await orderService.getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setPaymentMethod(methods[0].id);
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
      }
    };
    loadPaymentMethods();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = totalPrice;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (orderType === 'DINE_IN' && !tableNumber) {
      setError('Nomor meja harus diisi untuk dine in');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        orderType,
        tableNumber: orderType === 'DINE_IN' ? parseInt(tableNumber) : undefined,
        paymentMethod,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          levelPedas: item.levelPedas,
          kuahVarian: item.kuahVarian,
          notes: item.notes,
        })),
        notes,
      };

      const response = await orderService.createOrder(orderPayload);

      // Clear cart setelah order sukses
      clearCart();

      // Redirect ke order confirmation
      router.push(`/order-confirmation/${response.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat pesanan';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💳 Checkout
          </h1>
          <p className="text-gray-600">
            Lengkapi detail pesanan Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1️⃣ Tipe Pesanan
              </h2>

              <div className="space-y-3">
                {[
                  { value: 'DINE_IN', label: '🍽️ Makan di Tempat' },
                  { value: 'TAKEAWAY', label: '📦 Bawa Pulang' },
                  { value: 'DELIVERY', label: '🚗 Antar ke Rumah' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="orderType"
                      value={value}
                      checked={orderType === value}
                      onChange={(e) => setOrderType(e.target.value as any)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-semibold text-gray-900">{label}</span>
                  </label>
                ))}
              </div>

              {/* Table Number Input */}
              {orderType === 'DINE_IN' && (
                <div className="mt-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nomor Meja
                  </label>
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Contoh: 5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required={orderType === 'DINE_IN'}
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2️⃣ Metode Pembayaran
              </h2>

              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="font-semibold text-gray-900">{method.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { id: 'CASH', name: '💵 Tunai' },
                    { id: 'QRIS', name: '📱 QRIS' },
                    { id: 'BANK_TRANSFER', name: '🏦 Transfer Bank' },
                  ].map(({ id, name }) => (
                    <label key={id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={paymentMethod === id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="font-semibold text-gray-900">{name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3️⃣ Catatan Tambahan
              </h2>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan instruksi khusus untuk pesanan Anda (opsional)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                📋 Ringkasan Pesanan
              </h3>

              <div className="space-y-3 mb-6 pb-6 border-b max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.name} x{item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.levelPedas && `🌶️ ${item.levelPedas} • `}
                        {item.kuahVarian}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pajak (10%):</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-bold text-white text-lg transition ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? '⏳ Memproses...' : '✅ Pesan Sekarang'}
              </button>

              <Link
                href="/cart"
                className="block w-full mt-3 border border-red-600 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition text-center"
              >
                ← Kembali ke Keranjang
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}