'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import { menuService } from '@/services/menu';
import { MenuItem, MenuCategory } from '@/types';
import { MenuCard, MenuItemModal } from '@/components/menu';

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load items when category or search changes
  useEffect(() => {
    loadItems();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setError('');
      const data = await menuService.getCategories();
      setCategories(data);
      // Set first category as default
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      setError('');
      const data = await menuService.getMenuItems({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
      });
      setItems(data.items);
    } catch (err) {
      setError('Failed to load menu items');
      console.error(err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍜 Menu
          </h1>
          <p className="text-gray-600">
            Pilih menu favorit Anda dan customize sesuai keinginan
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Categories Filter */}
        {isLoadingCategories ? (
          <div className="mb-8 h-12 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                selectedCategory === ''
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-red-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items Grid */}
        {isLoadingItems ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-xl">
              No menu items found
            </p>
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}