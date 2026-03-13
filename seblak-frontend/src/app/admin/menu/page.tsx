'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { menuService } from '@/services/menu';
import { Navbar } from '@/components/layout';
import { MenuItem, MenuCategory } from '@/types';
import Link from 'next/link';

export default function AdminMenuPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    stock: 0,
  });

  // Redirect jika bukan admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    } else {
      loadMenuData();
    }
  }, [isAuthenticated, user, router]);

  // Load items saat category berubah
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategory) {
      loadMenuItems();
    }
  }, [selectedCategory]);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const catsData = await menuService.getCategories();
      setCategories(catsData);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const itemsData = await menuService.getMenuItems({
        categoryId: selectedCategory,
      });
      setItems(itemsData.items);
    } catch (err) {
      setError('Failed to load items');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await menuService.createMenuItem({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId || selectedCategory,
      });

      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        stock: 0,
      });
      await loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await menuService.deleteMenuItem(itemId);
      await loadMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🍜 Manage Menu
            </h1>
            <p className="text-gray-600">
              Add, edit, or delete menu items
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
          >
            ➕ Add Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Category Filter */}
        {isLoading ? (
          <div className="mb-8 h-12 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🍜</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Items in This Category
            </h2>
            <p className="text-gray-600">
              Add some delicious items to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(item.price)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    item.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Stock: {item.stock}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowEditModal(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ➕ Add Menu Item
            </h2>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-900 py-2 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}