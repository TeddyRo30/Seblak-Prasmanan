'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  levelPedas?: 'TIDAK_PEDAS' | 'SEDANG' | 'PEDAS';
  kuahVarian?: string;
  notes?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateItemDetails: (
    menuItemId: string,
    details: Partial<CartItem>
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'seblak_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
    setIsMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists
      const existingItem = prevItems.find(
        i => i.menuItemId === item.menuItemId &&
             i.levelPedas === item.levelPedas &&
             i.kuahVarian === item.kuahVarian
      );

      if (existingItem) {
        // Update quantity if same item with same options
        return prevItems.map(i =>
          i.menuItemId === item.menuItemId &&
          i.levelPedas === item.levelPedas &&
          i.kuahVarian === item.kuahVarian
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      // Add new item
      return [...prevItems, item];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setItems(prevItems =>
      prevItems.filter(item => item.menuItemId !== menuItemId)
    );
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateItemDetails = (
    menuItemId: string,
    details: Partial<CartItem>
  ) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, ...details }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemDetails,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook untuk menggunakan cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}