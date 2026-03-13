import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seblak Prasmanan',
  description: 'Order delicious seblak online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}