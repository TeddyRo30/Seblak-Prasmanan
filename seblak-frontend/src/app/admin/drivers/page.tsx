'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout';
import Link from 'next/link';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  isActive: boolean;
  rating: number;
  totalDeliveries: number;
}

export default function AdminDriversPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      phone: '081234567890',
      vehicle: 'Honda Beat',
      plateNumber: 'B 1234 ABC',
      isActive: true,
      rating: 4.8,
      totalDeliveries: 125,
    },
    {
      id: '2',
      name: 'Agus Wijaya',
      email: 'agus@example.com',
      phone: '081234567891',
      vehicle: 'Yamaha Mio',
      plateNumber: 'B 5678 XYZ',
      isActive: true,
      rating: 4.5,
      totalDeliveries: 98,
    },
  ]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect jika bukan admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const filteredDrivers = drivers.filter(d => {
    const matchStatus = !selectedStatus || (selectedStatus === 'active' ? d.isActive : !d.isActive);
    const matchSearch = !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

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
              🚗 Drivers Management
            </h1>
            <p className="text-gray-600">
              Manage delivery drivers and their performance
            </p>
          </div>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700">
            ➕ Add Driver
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="🔍 Search driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver) => (
              <div key={driver.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {driver.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{driver.phone}</p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      driver.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {driver.isActive ? '✅ Online' : '❌ Offline'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <p className="text-sm text-gray-700">
                    <strong>Vehicle:</strong> {driver.vehicle}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Plate:</strong> {driver.plateNumber}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {driver.email}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-500">
                      ⭐ {driver.rating}
                    </p>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {driver.totalDeliveries}
                    </p>
                    <p className="text-xs text-gray-600">Deliveries</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 text-blue-600 hover:text-blue-800 font-bold text-sm border border-blue-600 py-2 rounded hover:bg-blue-50">
                    ✏️ Edit
                  </button>
                  <button className="flex-1 text-red-600 hover:text-red-800 font-bold text-sm border border-red-600 py-2 rounded hover:bg-red-50">
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <p className="text-gray-600 text-lg">No drivers found</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 text-sm">Total Drivers</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{drivers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 text-sm">Online Drivers</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {drivers.filter(d => d.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 text-sm">Avg Rating</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 text-sm">Total Deliveries</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {drivers.reduce((sum, d) => sum + d.totalDeliveries, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}