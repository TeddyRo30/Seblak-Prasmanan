'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Navbar } from '@/components/layout';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Seblak Prasmanan 🍜
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Order delicious seblak with your favorite toppings and enjoy fast delivery!
          </p>

          {isAuthenticated ? (
            <Link
              href="/menu"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Order Now →
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Get Started →
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Get your delicious seblak delivered in 30 minutes!</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Customize</h3>
            <p className="text-gray-600">Choose your spice level, sauce, and toppings!</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Payment</h3>
            <p className="text-gray-600">Multiple payment methods available for your convenience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}