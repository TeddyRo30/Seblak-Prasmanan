'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

interface MenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export default function MenuItemModal({ item, onClose }: MenuItemModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [levelPedas, setLevelPedas] = useState<'TIDAK_PEDAS' | 'SEDANG' | 'PEDAS'>('SEDANG');
  const [kuahVarian, setKuahVarian] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = item.price * quantity;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addToCart({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        levelPedas,
        kuahVarian,
        notes,
        image: item.image,
      });

      setSuccessMessage(`${item.name} ditambahkan ke keranjang!`);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          {item.image && (
            <div className="relative w-full h-80 mb-6 rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-6 text-lg">
            {item.description}
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ {successMessage}
            </div>
          )}

          {/* Options */}
          <div className="space-y-6">
            {/* Spice Level */}
            <div>
              <label className="block text-gray-900 font-semibold mb-3">
                🌶️ Pilih Tingkat Kepedasan
              </label>
              <div className="flex gap-3">
                {(['TIDAK_PEDAS', 'SEDANG', 'PEDAS'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setLevelPedas(level)}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      levelPedas === level
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {level === 'TIDAK_PEDAS' && '😊 Tidak Pedas'}
                    {level === 'SEDANG' && '😅 Sedang'}
                    {level === 'PEDAS' && '🔥 Pedas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sauce Variant */}
            <div>
              <label className="block text-gray-900 font-semibold mb-3">
                🍯 Pilih Varian Kuah
              </label>
              <select
                value={kuahVarian}
                onChange={(e) => setKuahVarian(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="NORMAL">Kuah Normal</option>
                <option value="GURIH">Kuah Gurih</option>
                <option value="ASAM">Kuah Asam</option>
                <option value="MANIS">Kuah Manis</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-gray-900 font-semibold mb-3">
                Jumlah
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block text-gray-900 font-semibold mb-3">
                📝 Catatan Khusus (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tambah bawang, kurang garam..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Price & Add Button */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Harga per item:</span>
              <span className="text-lg font-semibold">{formatPrice(item.price)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-900 font-bold text-xl">Total:</span>
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isAdding || !item.isAvailable}
              className={`w-full py-3 rounded-lg font-bold text-white text-lg transition ${
                item.isAvailable && !isAdding
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isAdding ? '⏳ Menambahkan...' : '🛒 Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}