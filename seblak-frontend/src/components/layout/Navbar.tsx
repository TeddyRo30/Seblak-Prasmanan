'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-red-600">
            🍜 Seblak Prasmanan
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">
                  Welcome, <strong>{user?.fullName}</strong>
                </span>

                {/* Links berdasarkan role */}
                {user?.role === 'customer' && (
                  <>
                    <Link
                      href="/menu"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Menu
                    </Link>
                    <Link
                      href="/orders"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      My Orders
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link
                      href="/admin/dashboard"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Orders
                    </Link>
                  </>
                )}

                {user?.role === 'driver' && (
                  <>
                    <Link
                      href="/driver/deliveries"
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Deliveries
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 border border-red-600 rounded hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}