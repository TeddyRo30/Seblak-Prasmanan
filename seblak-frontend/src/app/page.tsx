'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-600">🍜 Seblak Prasmanan</h1>
            <nav className="space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600">Welcome, {user?.fullName}</span>
                  <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                    Dashboard
                  </Link>
                  <button className="text-red-600 hover:text-red-800">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-blue-600 hover:text-blue-800">
                    Login
                  </Link>
                  <Link href="/register" className="text-blue-600 hover:text-blue-800">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Seblak Prasmanan
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Order delicious seblak with your favorite toppings
          </p>

          {isAuthenticated ? (
            <Link
              href="/menu"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Order Now
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}