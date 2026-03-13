'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout';
import { menuService } from '@/services/menu';
import { MenuItem, MenuCategory } from '@/types';
import MenuCard from '@/components/menu/MenuCard';
import MenuItemModal from '@/components/menu/MenuItemModal';

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load items when filters change
  useEffect(() => {
    loadItems();
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setError('');
      const data = await menuService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      setError('Failed to load categories');
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
      
      let filtered = data.items;

      // Filter by price range
      filtered = filtered.filter(
        item => item.price >= priceRange.min && item.price <= priceRange.max
      );

      // Filter by availability
      if (showUnavailableOnly) {
        filtered = filtered.filter(item => !item.isAvailable);
      }

      // Sort
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      setItems(filtered);
    } catch (err) {
      setError('Failed to load menu items');
    } finally {
      setIsLoadingItems(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
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
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="🔍 Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
          >
            {showFilters ? '▼ Filters' : '▶ Filters'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-lg shadow p-6 space-y-6">
            {/* Price Range */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">💰 Price Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Min Price</label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        min: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(priceRange.min)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Max Price</label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(priceRange.max)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">📊 Sort By</h3>
              <div className="space-y-2">
                {[
                  { value: 'name', label: '🔤 Name (A-Z)' },
                  { value: 'price_asc', label: '💰 Price (Low to High)' },
                  { value: 'price_desc', label: '💰 Price (High to Low)' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value={value}
                      checked={sortBy === value}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnavailableOnly}
                  onChange={(e) => setShowUnavailableOnly(e.target.checked)}
                  className="w-4 h-4 mr-3"
                />
                <span className="font-semibold text-gray-700">
                  ⚠️ Show Unavailable Only
                </span>
              </label>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setPriceRange({ min: 0, max: 1000000 });
                setSortBy('name');
                setShowUnavailableOnly(false);
                setSearchQuery('');
              }}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50"
            >
              🔄 Reset Filters
            </button>
          </div>
        )}

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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>

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
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-xl">
              No items found matching your criteria
            </p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
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